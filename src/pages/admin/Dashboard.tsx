import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { Stats, Lead, Property } from "../../types";
import { formatPropertyId } from "../../utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/stats').then(res => res.json()),
      fetch('/api/leads').then(res => res.json()),
      fetch('/api/properties').then(res => res.json())
    ]).then(([statsData, leadsData, propertiesData]) => {
      setStats(statsData);
      setLeads(leadsData);
      setProperties(propertiesData);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading || !stats) return <div className="animate-pulse py-12 text-center text-gray-500">Calculando métricas...</div>;

  const chartData = [
    { name: 'Venda', qtd: stats.propertiesForSale },
    { name: 'Locação', qtd: stats.propertiesForRent },
  ];

  const getStatusCount = (status: string) => leads.filter(l => l.status === status).length;
  const totalLeads = leads.length || 1;

  const statusMetrics = [
    { name: "Novo", count: getStatusCount("novo"), color: "bg-blue-500" },
    { name: "Em Atendimento", count: getStatusCount("em_atendimento"), color: "bg-yellow-500" },
    { name: "Concluído", count: getStatusCount("concluido"), color: "bg-green-500" },
    { name: "Qualificado", count: getStatusCount("qualificado"), color: "bg-emerald-500" },
    { name: "Desqualificado", count: getStatusCount("desqualificado"), color: "bg-red-500" },
    { name: "Finalizado", count: getStatusCount("finalizado"), color: "bg-purple-500" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Métricas e relatórios consolidados da Blessed Imobiliária.</p>
      </div>
      
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total de Imóveis</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.totalProperties}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total de Leads</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.totalLeads}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Imóveis à Venda</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.propertiesForSale}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Imóveis para Locação</h3>
          <p className="text-3xl font-bold text-green-600">{stats.propertiesForRent}</p>
        </div>
      </div>

      {/* Charts & Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Properties Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <h3 className="text-lg font-bold mb-6">Distribuição de Imóveis</h3>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#F3F4F6'}} />
                <Bar dataKey="qtd" fill="#2563EB" radius={[4, 4, 0, 0]} maxBarSize={65} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Status Breakdown */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-6">Distribuição de Leads por Status</h3>
          <div className="space-y-4">
            {statusMetrics.map(item => {
              const pct = ((item.count / totalLeads) * 100).toFixed(0);
              return (
                <div key={item.name} className="space-y-1">
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <span className="text-gray-400">{item.name}</span>
                    <span className="text-gray-200">
                      {item.count} <span className="text-xs text-gray-500 font-normal">({pct}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-800/40 rounded-full h-2">
                    <div className={`${item.color} h-2 rounded-full`} style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detailed Leads Report */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold">Relatório Detalhado de Leads Recentes</h3>
            <p className="text-gray-500 text-xs mt-1">Últimos leads recebidos com interesse em imóveis específicos ou contato geral.</p>
          </div>
          <span className="bg-slate-900 text-slate-300 text-xs px-2.5 py-1 rounded-full font-bold border border-slate-800">
            Últimos {leads.slice(0, 5).length} leads
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                <th className="p-4">Data</th>
                <th className="p-4">Cliente / Mensagem</th>
                <th className="p-4">Contatos</th>
                <th className="p-4">Imóvel de Interesse</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {leads.slice(0, 5).map(lead => {
                const interestProperty = properties.find(p => Number(p.id) === Number(lead.propertyId));
                return (
                  <tr key={lead.id} className="border-b border-gray-50 hover:bg-gray-50/50 text-sm align-top">
                    <td className="p-4 text-gray-400 whitespace-nowrap text-xs">
                      {format(new Date(lead.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </td>
                    <td className="p-4 max-w-xs">
                      <div className="font-semibold text-gray-200">{lead.name}</div>
                      <div className="text-xs text-gray-400 mt-1 line-clamp-2 italic" title={lead.message}>
                        "{lead.message}"
                      </div>
                    </td>
                    <td className="p-4 space-y-0.5 text-xs whitespace-nowrap">
                      <div className="text-gray-300">{lead.email}</div>
                      <div className="text-gray-400">{lead.phone}</div>
                    </td>
                    <td className="p-4">
                      {interestProperty ? (
                        <div>
                          <div className="font-medium text-gray-300 line-clamp-1">{interestProperty.title}</div>
                          <span className="text-[10px] bg-blue-550/10 text-blue-500 px-1.5 py-0.5 rounded border border-blue-500/20 mt-1 inline-block font-mono">
                            ID: {formatPropertyId(interestProperty.id)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-xs italic">Contato Geral</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider
                        ${lead.status === 'novo' ? 'bg-blue-900/40 text-blue-400 border border-blue-800/60' : 
                          lead.status === 'em_atendimento' ? 'bg-yellow-900/40 text-yellow-400 border border-yellow-800/60' :
                          lead.status === 'concluido' ? 'bg-green-900/40 text-green-400 border border-green-800/60' :
                          lead.status === 'qualificado' ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-800/60' :
                          lead.status === 'desqualificado' ? 'bg-red-900/40 text-red-400 border border-red-800/60' :
                          'bg-purple-900/40 text-purple-400 border border-purple-800/60'
                        }`}
                      >
                        {lead.status === 'novo' ? 'Novo' :
                         lead.status === 'em_atendimento' ? 'Atendimento' :
                         lead.status === 'concluido' ? 'Concluído' :
                         lead.status === 'qualificado' ? 'Qualificado' :
                         lead.status === 'desqualificado' ? 'Desqualificado' :
                         'Finalizado'}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {leads.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 text-sm">
                    Nenhum lead capturado até o momento.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
