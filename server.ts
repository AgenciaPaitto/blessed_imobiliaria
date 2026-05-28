import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_KEY || "";

if (!supabaseUrl || !supabaseKey) {
  console.warn("WARNING: SUPABASE_URL or SUPABASE_KEY is missing in your environment variables. Please check your .env.local file!");
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(cors());
  app.use(express.json());

  // --- API Routes ---
  
  // Properties
  app.get("/api/properties", async (req, res) => {
    try {
      let query = supabase.from("properties").select("*");
      
      if (req.query.ids) {
        const idsArray = String(req.query.ids).split(',').map(id => Number(id)).filter(id => !isNaN(id));
        if (idsArray.length > 0) {
          query = query.in("id", idsArray);
        } else {
          return res.json([]);
        }
      }
      
      if (req.query.type) {
        query = query.eq("type", req.query.type);
      }
      if (req.query.status) {
        query = query.eq("status", req.query.status);
      }
      if (req.query.minPrice) {
        query = query.gte("price", Number(req.query.minPrice));
      }
      if (req.query.maxPrice) {
        query = query.lte("price", Number(req.query.maxPrice));
      }
      if (req.query.bedrooms) {
        query = query.gte("bedrooms", Number(req.query.bedrooms));
      }
      if (req.query.bathrooms) {
        query = query.gte("bathrooms", Number(req.query.bathrooms));
      }
      if (req.query.minArea) {
        query = query.gte("area", Number(req.query.minArea));
      }
      if (req.query.maxArea) {
        query = query.lte("area", Number(req.query.maxArea));
      }
      
      const { data, error } = await query.order("created_at", { ascending: false });
      
      if (error) throw error;
      
      // Map galleryImages array back to string for frontend backwards compatibility
      const formatted = (data || []).map(item => ({
        ...item,
        galleryImages: typeof item.galleryImages === 'string' ? item.galleryImages : JSON.stringify(item.galleryImages || [])
      }));
      
      res.json(formatted);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/properties/:id", async (req, res) => {
    try {
      const { data, error } = await supabase.from("properties").select("*").eq("id", Number(req.params.id)).single();
      if (error || !data) {
        return res.status(404).json({ error: "Not found" });
      }
      
      const formatted = {
        ...data,
        galleryImages: typeof data.galleryImages === 'string' ? data.galleryImages : JSON.stringify(data.galleryImages || [])
      };
      
      res.json(formatted);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/properties", async (req, res) => {
    const { title, description, price, type, status, bedrooms, bathrooms, area, image, virtualTourUrl, galleryImages, featured } = req.body;
    try {
      let parsedGallery = null;
      if (galleryImages) {
        try {
          parsedGallery = typeof galleryImages === 'string' ? JSON.parse(galleryImages) : galleryImages;
        } catch (e) {
          parsedGallery = [];
        }
      }
      
      const { data, error } = await supabase.from("properties").insert([{
        title,
        description,
        price: Number(price),
        type,
        status,
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        area: Number(area),
        image,
        galleryImages: parsedGallery,
        virtualTourUrl,
        featured: !!featured
      }]).select("id");
      
      if (error) throw error;
      if (!data || data.length === 0) throw new Error("Inserção falhou no Supabase");
      
      res.status(201).json({ id: data[0].id });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/properties/:id", async (req, res) => {
    try {
      const { error } = await supabase.from("properties").delete().eq("id", Number(req.params.id));
      if (error) throw error;
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Leads
  app.get("/api/leads", async (req, res) => {
    try {
      const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      res.json(data);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/leads", async (req, res) => {
    const { name, email, phone, message, propertyId } = req.body;
    try {
      const { data, error } = await supabase.from("leads").insert([{
        name,
        email,
        phone,
        message,
        propertyId: propertyId ? Number(propertyId) : null
      }]).select("id");
      
      if (error) throw error;
      if (!data || data.length === 0) throw new Error("Inserção falhou no Supabase");
      
      res.status(201).json({ id: data[0].id, message: "Lead criado com sucesso." });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.patch("/api/leads/:id/status", async (req, res) => {
    const { status } = req.body;
    try {
      const { error } = await supabase.from("leads").update({ status }).eq("id", Number(req.params.id));
      if (error) throw error;
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Dashboard Stats
  app.get("/api/stats", async (req, res) => {
    try {
      const { count: totalProperties, error: err1 } = await supabase.from("properties").select("*", { count: "exact", head: true });
      const { count: totalLeads, error: err2 } = await supabase.from("leads").select("*", { count: "exact", head: true });
      const { count: propertiesForSale, error: err3 } = await supabase.from("properties").select("*", { count: "exact", head: true }).eq("status", "venda");
      const { count: propertiesForRent, error: err4 } = await supabase.from("properties").select("*", { count: "exact", head: true }).eq("status", "locacao");
      
      if (err1 || err2 || err3 || err4) {
        throw err1 || err2 || err3 || err4;
      }
      
      res.json({
        totalProperties: totalProperties || 0,
        totalLeads: totalLeads || 0,
        propertiesForSale: propertiesForSale || 0,
        propertiesForRent: propertiesForRent || 0
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });


  // --- Vite Middleware (Development) / Static Files (Production) ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // For Express 4
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
