import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import PropertyCard from "../components/PropertyCard";
import type { Property } from "../types";
import { motion } from "motion/react";

export default function Home() {
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/properties')
      .then(res => res.json())
      .then(data => {
        setFeaturedProperties(data.filter((p: Property) => p.featured).slice(0, 3));
      });
  }, []);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const status = formData.get("status") as string;
    const type = formData.get("type") as string;
    
    let query = "/imoveis?";
    if (status) query += `status=${status}&`;
    if (type) query += `type=${type}&`;
    
    navigate(query);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative pt-32 pb-40 flex items-center justify-center min-h-[600px]">
        <div className="absolute inset-0 z-0">
          <img 
            src="/hero-img.jpg" 
            alt="Interior de casa moderna" 
            className="w-full h-full object-cover hero-brightness"
          />
        </div>
        
        <div className="container relative z-10 mx-auto px-4 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight"
          >
            Encontre o Imóvel dos <br /><span className="text-gold-gradient">Seus Sonhos</span> em Tangará
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-200 mb-10 max-w-2xl mx-auto"
          >
            A Blessed Incorporadora e Imobiliária traz as melhores opções de casas e apartamentos na região para você e sua família.
          </motion.p>
          
          {/* Search Box */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white p-4 md:p-6 rounded-2xl shadow-xl max-w-4xl mx-auto flex flex-col md:flex-row gap-4 items-end"
          >
            <form onSubmit={handleSearchSubmit} className="flex-1 flex flex-col md:flex-row gap-4 w-full">
              <div className="flex-1 text-left">
                <label className="block text-sm font-medium text-gray-700 mb-1">Finalidade</label>
                <select name="status" className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 py-2.5 px-3 border outline-none">
                  <option value="">Todos</option>
                  <option value="venda">Comprar</option>
                  <option value="locacao">Alugar</option>
                </select>
              </div>
              <div className="flex-1 text-left">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Imóvel</label>
                <select name="type" className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 py-2.5 px-3 border outline-none">
                  <option value="">Todos</option>
                  <option value="apartamento">Apartamento</option>
                  <option value="casa">Casa</option>
                  <option value="terreno">Terreno</option>
                </select>
              </div>
              <button type="submit" className="bg-blue-600 text-white px-8 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2 h-[46px]">
                <Search className="w-5 h-5" />
                Buscar
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Imóveis em <span className="text-gold-gradient">Destaque</span></h2>
              <p className="text-gray-600">As melhores oportunidades selecionadas para você.</p>
            </div>
            <Link to="/imoveis" className="hidden md:inline-block text-blue-600 font-medium hover:underline">
              Ver todos os imóveis &rarr;
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProperties.map((property, index) => (
              <PropertyCard key={property.id} property={property} index={index} />
            ))}
          </div>
          
          <div className="mt-8 text-center md:hidden">
            <Link to="/imoveis" className="inline-block text-blue-600 font-medium hover:underline">
              Ver todos os imóveis &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* About/CTA */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7 }}
            className="flex-1"
          >
            <img 
              src="https://images.unsplash.com/photo-1560518884-ce5872c3666b?auto=format&fit=crop&q=80&w=800"
              alt="Corretores"
              className="rounded-2xl shadow-lg"
            />
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7 }}
            className="flex-1"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Por que escolher a <span className="text-gold-gradient">Blessed</span>?</h2>
            <div className="space-y-6 text-gray-600">
              <p>
                Atuando em Tangará da Serra (MT), a Blessed Incorporadora e Imobiliária é referência 
                em transparência, ética e bons negócios. Nosso foco é entender a sua necessidade para 
                entregar o cenário ideal, seja para moradia ou investimento.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                  Atendimento ágil pelo WhatsApp
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                  Assessoria jurídica e imobiliária completa
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                  Amplo portfólio na região do Mato Grosso
                </li>
              </ul>
            </div>
            <div className="mt-8">
              <a href="https://wa.me/5565999999999" target="_blank" rel="noreferrer" className="inline-flex bg-green-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-600 transition">
                Fale com um Corretor
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
