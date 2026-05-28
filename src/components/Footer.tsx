import { BuildingIcon } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 text-sm mt-auto">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="mb-4">
            <img src="/logo-blessed.png" alt="Blessed Logo" className="h-18 w-auto object-contain" />
          </div>
          <p className="text-gray-400 mb-4">
            A sua imobiliária de confiança em Tangará da Serra. Ajudamos você a encontrar o imóvel dos seus sonhos com segurança e excelência.
          </p>
        </div>
        
        <div>
          <h4 className="text-white font-semibold mb-4">Links Rápidos</h4>
          <ul className="space-y-2">
            <li><a href="/" className="hover:text-blue-400 transition">Início</a></li>
            <li><a href="/imoveis" className="hover:text-blue-400 transition">Imóveis</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Contato</h4>
          <ul className="space-y-2">
            <li>Av. Brasil, 1234 - Centro</li>
            <li>Tangará da Serra - MT</li>
            <li>contato@blessedimoveis.com.br</li>
            <li>(65) 99999-9999</li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-white font-semibold mb-4">Horário de Atendimento</h4>
          <ul className="space-y-2">
            <li>Seg - Sex: 08:00 às 18:00</li>
            <li>Sábados: 08:00 às 12:00</li>
            <li>Domingo: Fechado</li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-8 pt-8 border-t border-gray-800 text-center text-gray-500">
        <p>© {new Date().getFullYear()} Blessed Incorporadora e Imobiliária. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}
