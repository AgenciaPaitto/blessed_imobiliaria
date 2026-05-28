import { useState, useEffect } from "react";
import PropertyCard from "../components/PropertyCard";
import type { Property } from "../types";
import { Heart, Search } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { useFavorites } from "../hooks/useFavorites";

export default function SavedProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const { favorites } = useFavorites();

  useEffect(() => {
    if (favorites.length === 0) {
      setProperties([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`/api/properties?ids=${favorites.join(',')}`)
      .then(res => res.json())
      .then(data => {
        setProperties(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [favorites]);

  return (
    <div className="bg-gray-50 min-h-screen pt-8 pb-20">
      <div className="container mx-auto px-4">
        
        <div className="flex items-center gap-3 mb-8 border-b border-gray-200 pb-4">
          <div className="bg-red-50 p-3 rounded-full">
            <Heart className="w-8 h-8 text-red-500 fill-red-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Imóveis Salvos</h1>
            <p className="text-gray-500">Seus imóveis favoritos selecionados</p>
          </div>
        </div>

        {loading ? (
          <div className="py-32 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {properties.map((property, index) => (
              <PropertyCard key={property.id} property={property} index={index} />
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-12 text-center rounded-xl border border-gray-100 shadow-sm max-w-2xl mx-auto mt-12"
          >
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Nenhum imóvel salvo</h3>
            <p className="text-gray-500 mb-8 text-lg">Você ainda não marcou nenhum imóvel como favorito. Clique no coração nos cards de imóveis para salvá-los aqui e compará-los depois.</p>
            
            <Link to="/imoveis" className="inline-flex items-center justify-center bg-blue-600 text-white font-medium px-8 py-3 rounded-lg hover:bg-blue-700 transition">
              <Search className="w-5 h-5 mr-2" />
              Explorar Imóveis
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
