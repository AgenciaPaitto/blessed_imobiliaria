import { Outlet, Link, useLocation, Navigate, useNavigate } from "react-router-dom";
import { BuildingIcon, LayoutDashboard, Home as HomeIcon, Users, ArrowLeft, LogOut, ShieldAlert } from "lucide-react";

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Check authentication
  const authUserString = localStorage.getItem("blessed_auth_user");
  if (!authUserString) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const authUser = JSON.parse(authUserString);

  const handleLogout = () => {
    localStorage.removeItem("blessed_auth_user");
    navigate("/login");
  };
  
  const navItems = [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { name: "Imóveis", path: "/admin/imoveis", icon: HomeIcon },
    { name: "Leads", path: "/admin/leads", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans text-gray-900">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-gray-900 text-white flex-shrink-0 flex flex-col">
        <div className="p-6 border-b border-gray-800 flex items-center justify-center">
          <img src="/logo-blessed.png" alt="Blessed Admin" className="h-10 w-auto object-contain" />
        </div>

        {/* Logged in User Profile Info */}
        <div className="px-6 py-4 border-b border-gray-800/50 bg-gray-950/20 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm">
            {authUser.name.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-200 line-clamp-1">{authUser.name}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
              {authUser.role === "admin" ? "Administrador" : "Corretor"}
            </p>
          </div>
        </div>
        
        <nav className="p-4 flex-1 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800 space-y-2">
          <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition px-4 py-2">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm border-b border-transparent hover:border-white pb-0.5">Voltar ao Site</span>
          </Link>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-950/20 transition px-4 py-2.5 rounded-lg text-left text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair do Painel</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
