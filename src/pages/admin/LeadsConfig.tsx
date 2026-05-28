import { useState, useEffect } from "react";
import type { Lead } from "../../types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function LeadsConfig() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLeads = () => {
    fetch('/api/leads')
      .then(res => res.json())
      .then(data => {
        setLeads(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const handleStatusChange = (id: number, status: string) => {
    fetch(`/api/leads/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    }).then(() => loadLeads());
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">CRM - Gestão de Leads</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm font-medium">
                <th className="p-4">Data</th>
                <th className="p-4">Nome</th>
                <th className="p-4">Contato</th>
                <th className="p-4">Imóvel (ID)</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-4 text-center">Carregando...</td></tr>
              ) : leads.map(lead => (
                <tr key={lead.id} className="border-b border-gray-50 hover:bg-gray-50 align-top">
                  <td className="p-4 text-sm text-gray-500 whitespace-nowrap">
                    {format(new Date(lead.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-gray-900">{lead.name}</div>
                    <div className="text-sm text-gray-500 mt-1 max-w-xs line-clamp-2" title={lead.message}>"{lead.message}"</div>
                  </td>
                  <td className="p-4 text-sm">
                    <div>{lead.email}</div>
                    <div className="text-gray-500">{lead.phone}</div>
                  </td>
                  <td className="p-4">
                    {lead.propertyId ? `#${lead.propertyId}` : '-'}
                  </td>
                  <td className="p-4">
                    <select 
                      value={lead.status}
                      onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                      className={`text-sm rounded px-2 py-1 outline-none border cursor-pointer font-medium
                        ${lead.status === 'novo' ? 'bg-blue-50 border-blue-200 text-blue-700' : 
                          lead.status === 'em_atendimento' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                          'bg-green-50 border-green-200 text-green-700'
                        }`}
                    >
                      <option value="novo">Novo</option>
                      <option value="em_atendimento">Em Atendimento</option>
                      <option value="concluido">Concluído</option>
                    </select>
                  </td>
                </tr>
              ))}
              {!loading && leads.length === 0 && (
                 <tr><td colSpan={5} className="p-8 text-center text-gray-500">Nenhum lead encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
