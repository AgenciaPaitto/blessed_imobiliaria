import { Link } from "react-router-dom";
import { BuildingIcon, HomeIcon, Menu, PhoneCall, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { useFavorites } from "../hooks/useFavorites";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { favorites } = useFavorites();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = () => {
      setIsLoggedIn(!!localStorage.getItem("blessed_auth_user"));
    };
    checkAuth();
    
    // Add event listener to listen for changes (in case of logouts/logins in same window)
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo-blessed-header.png" alt="Blessed Incorporadora e Imobiliária" className="h-12 w-auto object-contain" />
        </Link>
        
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link to="/" className="hover:text-blue-600 transition-colors">Início</Link>
          <Link to="/imoveis?status=venda" className="hover:text-blue-600 transition-colors">Comprar</Link>
          <Link to="/imoveis?status=locacao" className="hover:text-blue-600 transition-colors">Alugar</Link>
          <Link to="/imoveis" className="hover:text-blue-600 transition-colors">Todos os Imóveis</Link>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Link to="/salvos" className="relative flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-red-500 transition-colors group">
            <div className="relative">
              <Heart className="w-5 h-5 group-hover:fill-red-50 transition-colors" />
              {favorites.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </div>
            Salvos
          </Link>
          <a href="tel:+5565999999999" className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors">
            <PhoneCall className="w-4 h-4" />
            (65) 99999-9999
          </a>
          {isLoggedIn && (
            <Link to="/admin" className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1.5 rounded hover:bg-blue-100 transition-colors font-semibold">
              Painel Admin
            </Link>
          )}
        </div>

        <div className="md:hidden flex items-center gap-3">
          <Link to="/salvos" className="relative text-gray-600">
            <Heart className="w-5 h-5" />
            {favorites.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {favorites.length}
              </span>
            )}
          </Link>
          <button className="p-2" onClick={() => setIsOpen(!isOpen)}>
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white absolute w-full px-4 py-4 space-y-4">
          <Link to="/" className="block py-2 text-gray-600 font-medium border-b border-gray-50">Início</Link>
          <Link to="/imoveis?status=venda" className="block py-2 text-gray-600 font-medium border-b border-gray-50">Comprar</Link>
          <Link to="/imoveis?status=locacao" className="block py-2 text-gray-600 font-medium border-b border-gray-50">Alugar</Link>
          <Link to="/imoveis" className="block py-2 text-gray-600 font-medium border-b border-gray-50">Todos os Imóveis</Link>
          {isLoggedIn && (
            <Link to="/admin" className="block py-2 text-blue-600 font-medium">Painel Admin</Link>
          )}
        </div>
      )}
    </header>
  );
}
