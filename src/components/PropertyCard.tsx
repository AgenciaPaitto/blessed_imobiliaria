import { Link } from "react-router-dom";
import { Bed, Bath, Square, MapPin, PlayCircle, Heart, Trash2, Edit } from "lucide-react";
import { type Property } from "../types";
import { formatCurrency, formatPropertyId } from "../utils";
import { motion } from "motion/react";
import { useFavorites } from "../hooks/useFavorites";

export default function PropertyCard({ property, index = 0, isAdmin = false, onDelete, onEdit }: { key?: any, property: Property, index?: number, isAdmin?: boolean, onDelete?: (id: number) => void, onEdit?: (property: Property) => void }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const isFav = isFavorite(property.id);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 relative"
    >
      <button 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleFavorite(property.id);
        }}
        className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur p-2 rounded-full shadow-sm hover:bg-white transition-colors"
      >
        <Heart className={`w-5 h-5 transition-colors ${isFav ? 'fill-red-500 text-red-500' : 'text-gray-600 hover:text-red-500'}`} />
      </button>
      <Link to={`/imovel/${property.id}`} className="block relative overflow-hidden aspect-[4/3] bg-gray-100">
        <img 
          src={property.image || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800'} 
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {isAdmin && (
            <span className="bg-slate-950/90 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded tracking-wider shadow-sm uppercase w-max border border-white/10">
              {formatPropertyId(property.id)}
            </span>
          )}
          <div className="flex gap-2">
            <span className="bg-white/90 backdrop-blur text-gray-900 text-xs font-semibold px-3 py-1.5 rounded uppercase tracking-wider shadow-sm">
              {property.status === 'venda' ? 'Venda' : 'Locação'}
            </span>
            {property.featured && (
               <span className="bg-blue-600/90 backdrop-blur text-white text-xs font-semibold px-3 py-1.5 rounded uppercase tracking-wider shadow-sm">
                Destaque
              </span>
            )}
          </div>
          {property.virtualTourUrl && (
            <div className="inline-flex">
              <span className="bg-purple-600/90 backdrop-blur text-white text-xs font-semibold px-3 py-1.5 rounded uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <PlayCircle className="w-3.5 h-3.5" />
                Tour Virtual
              </span>
            </div>
          )}
        </div>
      </Link>
      
      <div className="p-5">
        <div className="flex items-center gap-1 text-gray-500 text-sm mb-2">
          <MapPin className="w-4 h-4" />
          <span>{property.city}, {property.state}</span>
        </div>
        
        <Link to={`/imovel/${property.id}`}>
          <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {property.title}
          </h3>
        </Link>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {property.description}
        </p>
        
        <div className="flex items-center justify-between font-semibold text-xl text-blue-600 mb-4">
          {formatCurrency(property.price)}
          {property.status === 'locacao' && <span className="text-sm text-gray-500 font-normal">/mês</span>}
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5" title="Quartos">
              <Bed className="w-4 h-4 text-gray-400" />
              <span>{property.bedrooms}</span>
            </div>
            <div className="flex items-center gap-1.5" title="Banheiros">
              <Bath className="w-4 h-4 text-gray-400" />
              <span>{property.bathrooms}</span>
            </div>
            <div className="flex items-center gap-1.5" title="Área">
              <Square className="w-4 h-4 text-gray-400" />
              <span>{property.area} m²</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onEdit(property);
                }}
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50/50 p-1.5 rounded transition cursor-pointer"
                title="Editar Imóvel"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete(property.id);
                }}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded transition cursor-pointer"
                title="Excluir Imóvel"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
