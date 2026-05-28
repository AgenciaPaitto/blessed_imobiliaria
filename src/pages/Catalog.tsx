import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import PropertyCard from "../components/PropertyCard";
import type { Property } from "../types";
import { Filter, Search } from "lucide-react";
import { motion } from "motion/react";

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states mirrored to URL search params
  const status = searchParams.get("status") || "";
  const type = searchParams.get("type") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const bedrooms = searchParams.get("bedrooms") || "";
  const bathrooms = searchParams.get("bathrooms") || "";
  const minArea = searchParams.get("minArea") || "";
  const maxArea = searchParams.get("maxArea") || "";

  useEffect(() => {
    setLoading(true);
    let url = "/api/properties?";
    if (status) url += `status=${status}&`;
    if (type) url += `type=${type}&`;
    if (minPrice) url += `minPrice=${minPrice}&`;
    if (maxPrice) url += `maxPrice=${maxPrice}&`;
    if (bedrooms) url += `bedrooms=${bedrooms}&`;
    if (bathrooms) url += `bathrooms=${bathrooms}&`;
    if (minArea) url += `minArea=${minArea}&`;
    if (maxArea) url += `maxArea=${maxArea}&`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setProperties(data);
        setLoading(false);
      });
  }, [status, type, minPrice, maxPrice, bedrooms, bathrooms, minArea, maxArea]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    if (value) {
      searchParams.set(name, value);
    } else {
      searchParams.delete(name);
    }
    setSearchParams(searchParams);
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newStatus = formData.get("status") as string;
    const newType = formData.get("type") as string;
    
    if (newStatus) searchParams.set("status", newStatus); else searchParams.delete("status");
    if (newType) searchParams.set("type", newType); else searchParams.delete("type");
    
    setSearchParams(searchParams);
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      
      {/* Horizontal Search Banner (Replicated from Home) */}
      <div className="bg-gray-900 py-10 mb-8 border-b border-gray-800">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white p-4 md:p-6 rounded-2xl shadow-xl max-w-4xl mx-auto flex flex-col md:flex-row gap-4 items-end"
          >
            <form onSubmit={handleSearchSubmit} className="flex-1 flex flex-col md:flex-row gap-4 w-full">
              <div className="flex-1 text-left">
                <label className="block text-sm font-medium text-gray-700 mb-1">Finalidade</label>
                <select name="status" value={status} onChange={handleFilterChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 py-2.5 px-3 border outline-none">
                  <option value="">Todos</option>
                  <option value="venda">Comprar</option>
                  <option value="locacao">Alugar</option>
                </select>
              </div>
              <div className="flex-1 text-left">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Imóvel</label>
                <select name="type" value={type} onChange={handleFilterChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 py-2.5 px-3 border outline-none">
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
      </div>

      <div className="container mx-auto px-4">
        
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Filters */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:w-1/4"
          >
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm sticky top-24">
              <div className="flex items-center gap-2 mb-6 text-gray-900 font-semibold text-lg border-b pb-4">
                <Filter className="w-5 h-5" />
                Filtros
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preço Mínimo (R$)</label>
                  <input type="number" name="minPrice" value={minPrice} onChange={handleFilterChange} placeholder="Ex: 1000" className="w-full border-gray-300 rounded border p-2 text-sm outline-none focus:border-blue-500" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preço Máximo (R$)</label>
                  <input type="number" name="maxPrice" value={maxPrice} onChange={handleFilterChange} placeholder="Ex: 500000" className="w-full border-gray-300 rounded border p-2 text-sm outline-none focus:border-blue-500" />
                </div>
                
                <div className="pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Características</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quartos</label>
                      <select name="bedrooms" value={bedrooms} onChange={handleFilterChange} className="w-full border-gray-300 rounded border p-2 text-sm outline-none focus:border-blue-500">
                        <option value="">Qualquer</option>
                        <option value="1">1+ quarto(s)</option>
                        <option value="2">2+ quartos</option>
                        <option value="3">3+ quartos</option>
                        <option value="4">4+ quartos</option>
                        <option value="5">5+ quartos</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Banheiros</label>
                      <select name="bathrooms" value={bathrooms} onChange={handleFilterChange} className="w-full border-gray-300 rounded border p-2 text-sm outline-none focus:border-blue-500">
                        <option value="">Qualquer</option>
                        <option value="1">1+ banheiro(s)</option>
                        <option value="2">2+ banheiros</option>
                        <option value="3">3+ banheiros</option>
                        <option value="4">4+ banheiros</option>
                        <option value="5">5+ banheiros</option>
                      </select>
                    </div>

                    <div className="flex gap-2">
                      <div className="w-1/2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Área Min (m²)</label>
                        <input type="number" name="minArea" value={minArea} onChange={handleFilterChange} placeholder="0" className="w-full border-gray-300 rounded border p-2 text-sm outline-none focus:border-blue-500" />
                      </div>
                      <div className="w-1/2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Área Max</label>
                        <input type="number" name="maxArea" value={maxArea} onChange={handleFilterChange} placeholder="1000" className="w-full border-gray-300 rounded border p-2 text-sm outline-none focus:border-blue-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Properties Grid */}
          <div className="lg:w-3/4">
            <div className="mb-6 flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Imóveis Encontrados
              </h1>
              <span className="text-gray-500">{properties.length} resultados</span>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : properties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {properties.map((property, index) => (
                  <PropertyCard key={property.id} property={property} index={index} />
                ))}
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-12 text-center rounded-xl border border-gray-100 shadow-sm"
              >
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Nenhum imóvel encontrado</h3>
                <p className="text-gray-500 mt-1">Tente ajustar seus filtros para ver mais resultados.</p>
                <button 
                  onClick={() => setSearchParams({})}
                  className="mt-6 text-blue-600 font-medium hover:underline"
                >
                  Limpar todos os filtros
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
