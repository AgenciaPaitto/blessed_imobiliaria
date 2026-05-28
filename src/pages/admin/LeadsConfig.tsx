import { useState, useEffect } from "react";
import type { Lead, Property } from "../../types";
import { formatPropertyId } from "../../utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Table, Kanban, Plus, Trash2, Mail, Phone, Calendar, User, MessageCircle } from "lucide-react";

export default function LeadsConfig() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const getWhatsAppUrl = (phone: string, name: string, propertyId?: number | null) => {
    const cleaned = phone.replace(/\D/g, "");
    const withCountryCode = cleaned.startsWith("55") 
      ? cleaned 
      : (cleaned.length >= 10 ? `55${cleaned}` : cleaned);
    
    const firstName = name.trim().split(" ")[0];
    let message = `Olá ${firstName}, sou o corretor da Blessed Imobiliária. Recebi seu contato através de nosso site. Como posso te ajudar?`;
    
    if (propertyId) {
      const property = properties.find(p => Number(p.id) === Number(propertyId));
      if (property) {
        message = `Olá ${firstName}, sou o corretor da Blessed Imobiliária. Vi que demonstrou interesse no imóvel "${property.title}" (Ref: ${formatPropertyId(propertyId)}) anunciado para ${property.status === 'venda' ? 'venda' : 'locação'}. Como posso te ajudar?`;
      }
    }
    
    return `https://wa.me/${withCountryCode}?text=${encodeURIComponent(message)}`;
  };
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>(() => {
    const saved = localStorage.getItem("blessed_crm_view_mode");
    return (saved === 'table' || saved === 'kanban') ? saved : 'table';
  });
  const handleViewModeChange = (mode: 'table' | 'kanban') => {
    setViewMode(mode);
    localStorage.setItem("blessed_crm_view_mode", mode);
  };
  const [columns, setColumns] = useState<string[]>(() => {
    const saved = localStorage.getItem("blessed_crm_columns");
    const parsed = saved ? JSON.parse(saved) : ["novo", "em_atendimento", "concluido"];
    
    // Ensure fixed columns are always present
    const fixed = ["novo", "em_atendimento", "concluido", "qualificado", "desqualificado", "finalizado"];
    const merged = [...parsed];
    fixed.forEach(col => {
      if (!merged.includes(col)) {
        merged.push(col);
      }
    });
    return merged;
  });
  const [draggedOverCol, setDraggedOverCol] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, leadId: number) => {
    e.dataTransfer.setData("text/plain", leadId.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnter = (e: React.DragEvent, col: string) => {
    e.preventDefault();
    setDraggedOverCol(col);
  };

  const handleDragLeave = () => {
    setDraggedOverCol(null);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    setDraggedOverCol(null);
    const leadIdStr = e.dataTransfer.getData("text/plain");
    if (!leadIdStr) return;
    const leadId = Number(leadIdStr);
    if (isNaN(leadId)) return;
    handleStatusChange(leadId, targetStatus);
  };

  const loadLeads = () => {
    fetch('/api/leads')
      .then(res => res.json())
      .then(data => {
        setLeads(data);
        setLoading(false);
      });
  };

  const loadProperties = () => {
    fetch('/api/properties')
      .then(res => res.json())
      .then(data => {
        setProperties(data);
      });
  };

  useEffect(() => {
    loadLeads();
    loadProperties();
  }, []);

  const saveColumns = (newCols: string[]) => {
    setColumns(newCols);
    localStorage.setItem("blessed_crm_columns", JSON.stringify(newCols));
  };

  const handleStatusChange = (id: number, status: string) => {
    fetch(`/api/leads/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    }).then(() => loadLeads());
  };

  const formatColumnName = (col: string) => {
    switch (col) {
      case "novo": return "Novo";
      case "em_atendimento": return "Em Atendimento";
      case "concluido": return "Concluído";
      case "qualificado": return "Qualificado";
      case "desqualificado": return "Desqualificado";
      case "finalizado": return "Finalizado";
      default: return col.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
  };

  const handleAddList = () => {
    const name = prompt("Digite o nome da nova lista (ex: Em Negociação):");
    if (!name || !name.trim()) return;
    const key = name.trim().toLowerCase().replace(/\s+/g, '_');
    if (columns.includes(key)) {
      alert("Esta lista já existe!");
      return;
    }
    saveColumns([...columns, key]);
  };

  const handleDeleteList = (colToDelete: string) => {
    const fixed = ["novo", "em_atendimento", "concluido", "qualificado", "desqualificado", "finalizado"];
    if (fixed.includes(colToDelete)) {
      alert("Não é possível excluir esta lista. Esta é uma lista padrão do sistema.");
      return;
    }
    if (columns.length <= 3) {
      alert("Não é possível excluir esta lista. O painel deve manter no mínimo 3 listas ativas.");
      return;
    }
    const remainingCols = columns.filter(c => c !== colToDelete);
    const fallbackCol = remainingCols[0];

    if (confirm(`Tem certeza que deseja excluir a lista "${formatColumnName(colToDelete)}"? Leads nessa lista não serão excluídos, mas serão movidos para a lista "${formatColumnName(fallbackCol)}".`)) {
      saveColumns(remainingCols);
      
      const leadsToMove = leads.filter(l => l.status === colToDelete);
      Promise.all(leadsToMove.map(l => 
        fetch(`/api/leads/${l.id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: fallbackCol })
        })
      )).then(() => loadLeads());
    }
  };

  return (
    <div>
      {/* Title & Controls Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CRM - Gestão de Leads</h1>
          <p className="text-gray-500 text-sm mt-1">Gerencie os contatos recebidos do site.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Toggle buttons */}
          <div className="bg-gray-100 p-1 rounded-lg flex items-center border border-gray-200">
            <button
              onClick={() => handleViewModeChange('table')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-sm font-semibold transition-all ${
                viewMode === 'table' 
                  ? "bg-white text-gray-900 shadow-sm border border-gray-200/10" 
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <Table className="w-4 h-4" />
              Tabela
            </button>
            <button
              onClick={() => handleViewModeChange('kanban')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-sm font-semibold transition-all ${
                viewMode === 'kanban' 
                  ? "bg-white text-gray-900 shadow-sm border border-gray-200/10" 
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <Kanban className="w-4 h-4" />
              Kanban
            </button>
          </div>

          {/* Add list button (only when kanban is active) */}
          {viewMode === 'kanban' && (
            <button
              onClick={handleAddList}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg shadow-sm hover:shadow transition flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Nova Lista
            </button>
          )}
        </div>
      </div>

      {viewMode === 'kanban' ? (
        /* Kanban View */
        <div className="flex gap-6 overflow-x-auto pb-6 -mx-6 px-6 scrollbar-thin select-none">
          {columns.map(col => {
            const columnLeads = leads.filter(l => l.status === col);
            const isOver = draggedOverCol === col;
            const borderClass = isOver 
              ? "border-blue-500 shadow-[0_0_15px_rgba(197,159,61,0.25)] scale-[1.01]" 
              : col === 'qualificado' 
                ? "border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.05)]" 
                : col === 'desqualificado' 
                  ? "border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.05)]" 
                  : col === 'finalizado' 
                    ? "border-blue-600/60 shadow-[0_0_10px_rgba(197,159,61,0.05)]" 
                    : "border-slate-800";

            return (
              <div 
                key={col} 
                onDragOver={handleDragOver}
                onDragEnter={(e) => handleDragEnter(e, col)}
                onDrop={(e) => handleDrop(e, col)}
                className={`w-80 flex-shrink-0 flex flex-col bg-slate-900 rounded-2xl border p-4 transition-all duration-200 ${borderClass}`}
              >
                {/* Column Header */}
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-100 text-sm">{formatColumnName(col)}</h3>
                    <span className="bg-slate-950 text-slate-300 text-xs px-2.5 py-0.5 rounded-full font-bold border border-slate-800/80">
                      {columnLeads.length}
                    </span>
                  </div>
                  
                  {/* Delete button (visible when there are more than 3 columns and not a fixed column) */}
                  {columns.length > 3 && !["novo", "em_atendimento", "concluido", "qualificado", "desqualificado", "finalizado"].includes(col) && (
                    <button 
                      onClick={() => handleDeleteList(col)}
                      className="text-gray-400 hover:text-red-500 transition p-1 rounded hover:bg-gray-850 cursor-pointer"
                      title="Excluir lista"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Leads List */}
                <div className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-[60vh] min-h-[300px] pr-1">
                  {loading ? (
                    <div className="text-center py-8 text-gray-400 text-xs animate-pulse">Carregando...</div>
                  ) : columnLeads.length === 0 ? (
                    <div className="border border-dashed border-slate-800 rounded-xl p-6 text-center text-slate-400 text-xs flex flex-col items-center justify-center min-h-[120px] bg-slate-950/20">
                      Solte o lead aqui
                    </div>
                  ) : (
                    columnLeads.map(lead => (
                      <div 
                        key={lead.id} 
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, lead.id)}
                        className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 shadow-sm hover:shadow-md hover:border-slate-700/80 transition flex flex-col gap-3 cursor-grab active:cursor-grabbing"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              {format(new Date(lead.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                            </span>
                            {lead.propertyId && (
                              <span className="bg-blue-50 text-blue-750 text-[10px] font-bold px-1.5 py-0.5 rounded border border-blue-200">
                                Imóvel {formatPropertyId(lead.propertyId)}
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                            <User className="w-4 h-4 text-slate-400" />
                            {lead.name}
                          </h4>
                        </div>

                        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/40 text-xs text-slate-200 italic line-clamp-3" title={lead.message}>
                          "{lead.message}"
                        </div>

                        <div className="text-xs text-slate-300 space-y-1 bg-slate-900/30 p-2 rounded-lg border border-slate-800/40">
                          <div className="flex items-center gap-2 truncate">
                            <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <a href={`mailto:${lead.email}`} className="hover:text-blue-400 hover:underline truncate">{lead.email}</a>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <a href={`tel:${lead.phone}`} className="hover:text-blue-400 hover:underline">{lead.phone}</a>
                          </div>
                        </div>

                        <div className="flex gap-2 items-center w-full">
                          {lead.phone ? (
                            <a 
                              href={getWhatsAppUrl(lead.phone, lead.name, lead.propertyId)} 
                              target="_blank" 
                              rel="noreferrer"
                              className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold py-2 px-3 rounded-lg shadow-sm transition active:translate-y-[1px] select-none cursor-pointer truncate"
                            >
                              <MessageCircle className="w-3.5 h-3.5 fill-white flex-shrink-0" />
                              WhatsApp
                            </a>
                          ) : (
                            <div className="flex-1 text-slate-500 text-[10px] text-center font-medium italic">Sem telefone</div>
                          )}
                          
                          <select
                            value={["qualificado", "desqualificado", "finalizado"].includes(lead.status) ? lead.status : ""}
                            onChange={(e) => {
                              if (e.target.value) {
                                handleStatusChange(lead.id, e.target.value);
                              }
                            }}
                            className="bg-slate-900 border border-slate-800 text-slate-200 text-xs font-semibold py-2 px-2.5 rounded-lg focus:outline-none focus:border-blue-500 cursor-pointer w-[115px] text-center"
                          >
                            <option value="" disabled>Finalizar</option>
                            <option value="qualificado">Qualificado</option>
                            <option value="desqualificado">Desqualificado</option>
                            <option value="finalizado">Finalizado</option>
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
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
                  <tr><td colSpan={5} className="p-4 text-center text-gray-400 text-sm">Carregando...</td></tr>
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
                      <div className="flex items-center gap-1.5 mt-1 text-gray-500">
                        <span>{lead.phone}</span>
                        {lead.phone && (
                          <a 
                            href={getWhatsAppUrl(lead.phone, lead.name, lead.propertyId)} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-green-500 hover:text-green-400 transition"
                            title="Conversar no WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5 fill-green-500/10" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-sm">
                      {lead.propertyId ? formatPropertyId(lead.propertyId) : '-'}
                    </td>
                    <td className="p-4">
                      <select 
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                        className={`text-sm rounded px-2.5 py-1.5 outline-none border cursor-pointer font-medium
                          ${lead.status === 'novo' ? 'bg-blue-50 border-blue-200 text-blue-700' : 
                            lead.status === 'em_atendimento' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                            lead.status === 'concluido' ? 'bg-green-50 border-green-200 text-green-700' :
                            lead.status === 'qualificado' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                            lead.status === 'desqualificado' ? 'bg-red-50 border-red-200 text-red-700' :
                            lead.status === 'finalizado' ? 'bg-purple-50 border-purple-200 text-purple-700' :
                            'bg-slate-50 border-slate-200 text-slate-750'
                          }`}
                      >
                        {columns.map(c => (
                          <option key={c} value={c}>{formatColumnName(c)}</option>
                        ))}
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
      )}
    </div>
  );
}

