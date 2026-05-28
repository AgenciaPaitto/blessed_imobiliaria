import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BuildingIcon, Lock, Mail, AlertCircle, Eye, EyeOff, CheckCircle } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Redirect path after login
  const from = (location.state as any)?.from?.pathname || "/admin";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    // Simulate network delay
    setTimeout(() => {
      const normalizedEmail = email.trim().toLowerCase();
      
      // Default credentials
      const isAdmin = (normalizedEmail === "admin@blessed.com" || normalizedEmail === "admin") && password === "admin123";
      const isCorretor = (normalizedEmail === "corretor@blessed.com" || normalizedEmail === "corretor") && password === "corretor123";

      if (isAdmin || isCorretor) {
        const user = {
          email: normalizedEmail.includes("@") ? normalizedEmail : `${normalizedEmail}@blessed.com`,
          name: isAdmin ? "Administrador" : "Corretor Blessed",
          role: isAdmin ? "admin" : "corretor"
        };
        
        localStorage.setItem("blessed_auth_user", JSON.stringify(user));
        setSuccess("Login realizado com sucesso! Redirecionando...");
        
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 1000);
      } else {
        setError("E-mail/Usuário ou senha incorretos.");
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl p-8 relative overflow-hidden">
        
        {/* Decorative ambient lights */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col items-center mb-8 relative">
          <img src="/logo-blessed.png" alt="Blessed Incorporadora e Imobiliária" className="h-16 w-auto object-contain mb-4" />
          <p className="text-slate-400 text-sm mt-1">Área Restrita para Corretores & Admin</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-200 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-3 text-emerald-200 text-sm">
            <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-400" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5 relative">
          <div>
            <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">
              Usuário ou E-mail
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Mail className="w-5 h-5" />
              </span>
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@blessed.com ou admin"
                className="w-full bg-slate-950/40 border border-white/10 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-slate-500 transition text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">
              Senha
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Lock className="w-5 h-5" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950/40 border border-white/10 text-white rounded-lg pl-10 pr-10 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-slate-500 transition text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-lg shadow-lg shadow-blue-500/20 active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 mt-2 text-sm"
          >
            {isLoading ? (
              <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              "Entrar no Painel"
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <p className="text-slate-400 text-xs mb-3">Credenciais de Acesso para Teste:</p>
          <div className="inline-grid grid-cols-2 gap-4 text-left max-w-sm mx-auto text-xs bg-slate-950/30 p-3 rounded-lg border border-white/5">
            <div>
              <p className="font-semibold text-blue-400">Administrador:</p>
              <p className="text-slate-300 select-all">admin</p>
              <p className="text-slate-500">Senha: <span className="text-slate-300 select-all">admin123</span></p>
            </div>
            <div>
              <p className="font-semibold text-emerald-400">Corretor:</p>
              <p className="text-slate-300 select-all">corretor</p>
              <p className="text-slate-500">Senha: <span className="text-slate-300 select-all">corretor123</span></p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-xs text-slate-400 hover:text-white hover:underline transition"
          >
            Voltar para a página inicial
          </a>
        </div>
      </div>
    </div>
  );
}
