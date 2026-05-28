import React, { useState, useEffect } from "react";
import { Plus, Trash2, Search, Table, LayoutGrid, Edit } from "lucide-react";
import type { Property } from "../../types";
import { formatCurrency, formatPropertyId } from "../../utils";
import PropertyCard from "../../components/PropertyCard";

export default function PropertiesConfig() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'table' | 'cards'>(() => {
    const saved = localStorage.getItem("blessed_properties_view_mode");
    return (saved === 'table' || saved === 'cards') ? saved : 'table';
  });

  const handleViewModeChange = (mode: 'table' | 'cards') => {
    setViewMode(mode);
    localStorage.setItem("blessed_properties_view_mode", mode);
  };

  const loadProperties = () => {
    setLoading(true);
    fetch('/api/properties')
      .then(res => res.json())
      .then(data => {
        setProperties(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadProperties();
  }, []);

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este imóvel?")) {
      fetch(`/api/properties/${id}`, { method: 'DELETE' })
        .then(() => loadProperties());
    }
  };

  const handleEdit = (property: Property) => {
    setEditingProperty(property);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingProperty(null);
    setIsModalOpen(false);
  };

  const handleAddSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    // Convert numeric fields and boolean
    const payload = {
      ...data,
      price: Number(data.price),
      bedrooms: Number(data.bedrooms),
      bathrooms: Number(data.bathrooms),
      area: Number(data.area),
      featured: data.featured === 'on',
      city: String(data.city),
      state: String(data.state)
    };

    const url = editingProperty ? `/api/properties/${editingProperty.id}` : '/api/properties';
    const method = editingProperty ? 'PUT' : 'POST';

    fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(() => {
      setIsModalOpen(false);
      setEditingProperty(null);
      loadProperties();
    });
  };

  const filteredProperties = properties.filter(p => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    
    const formattedId = String(p.id).padStart(4, '0');
    const rawId = String(p.id);
    
    return (
      p.title.toLowerCase().includes(query) ||
      p.city.toLowerCase().includes(query) ||
      p.type.toLowerCase().includes(query) ||
      p.status.toLowerCase().includes(query) ||
      formattedId.includes(query) ||
      rawId === query
    );
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Gestão de Imóveis</h1>
        <button 
          onClick={() => {
            setEditingProperty(null);
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Novo Imóvel
        </button>
      </div>

      {/* Search & Layout toggle bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar por título, ID, tipo ou finalidade..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-gray-100 p-1 rounded-lg flex items-center border border-gray-200">
            <button
              onClick={() => handleViewModeChange('table')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${
                viewMode === 'table' 
                  ? "bg-white text-gray-900 shadow-sm border border-gray-200/10" 
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <Table className="w-4 h-4" />
              Tabela
            </button>
            <button
              onClick={() => handleViewModeChange('cards')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${
                viewMode === 'cards' 
                  ? "bg-white text-gray-900 shadow-sm border border-gray-200/10" 
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Cards
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12 text-gray-400 text-sm animate-pulse">Carregando...</div>
          ) : filteredProperties.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200 shadow-sm text-sm">
              Nenhum imóvel encontrado.
            </div>
          ) : (
            filteredProperties.map(p => (
              <PropertyCard 
                key={p.id} 
                property={p} 
                isAdmin={true} 
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            ))
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm font-medium">
                  <th className="p-4">ID</th>
                  <th className="p-4">Foto</th>
                  <th className="p-4">Título</th>
                  <th className="p-4">Finalidade</th>
                  <th className="p-4">Preço</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="p-4 text-center text-gray-400 text-sm">Carregando...</td></tr>
                ) : filteredProperties.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-gray-500 text-sm">Nenhum imóvel encontrado.</td></tr>
                ) : (
                  filteredProperties.map(p => (
                    <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="p-4 text-gray-500 text-sm font-mono">{formatPropertyId(p.id)}</td>
                      <td className="p-4">
                        <img src={p.image || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=100"} alt="Thumb" className="w-12 h-12 rounded object-cover" />
                      </td>
                      <td className="p-4 font-medium text-sm max-w-[200px] truncate">{p.title}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs uppercase font-semibold ${p.status === 'venda' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="p-4 text-sm">{formatCurrency(p.price)}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button 
                            onClick={() => handleEdit(p)} 
                            className="text-blue-600 hover:bg-blue-50 p-2 rounded transition cursor-pointer"
                            title="Editar Imóvel"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(p.id)} 
                            className="text-red-500 hover:bg-red-50 p-2 rounded transition cursor-pointer"
                            title="Excluir Imóvel"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold">{editingProperty ? "Editar Imóvel" : "Adicionar Imóvel"}</h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-900">&times;</button>
            </div>
            
            <form key={editingProperty?.id || 'new'} onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Título</label>
                  <input required name="title" defaultValue={editingProperty?.title || ''} className="w-full border rounded p-2" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Descrição</label>
                  <textarea required name="description" rows={3} defaultValue={editingProperty?.description || ''} className="w-full border rounded p-2"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Preço (R$)</label>
                  <input required type="number" step="0.01" name="price" defaultValue={editingProperty?.price || ''} className="w-full border rounded p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tipo</label>
                  <select name="type" defaultValue={editingProperty?.type || 'apartamento'} className="w-full border rounded p-2 bg-white">
                    <option value="apartamento">Apartamento</option>
                    <option value="casa">Casa</option>
                    <option value="terreno">Terreno</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Finalidade</label>
                  <select name="status" defaultValue={editingProperty?.status || 'venda'} className="w-full border rounded p-2 bg-white">
                    <option value="venda">Venda</option>
                    <option value="locacao">Locação</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Quartos</label>
                  <input required type="number" name="bedrooms" defaultValue={editingProperty?.bedrooms ?? 1} className="w-full border rounded p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Banheiros</label>
                  <input required type="number" name="bathrooms" defaultValue={editingProperty?.bathrooms ?? 1} className="w-full border rounded p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Área (m²)</label>
                  <input required type="number" name="area" defaultValue={editingProperty?.area ?? 50} className="w-full border rounded p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Cidade</label>
                  <input required name="city" defaultValue={editingProperty?.city || ''} placeholder="Ex: Rio de Janeiro" className="w-full border rounded p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Estado (UF)</label>
                  <input required name="state" defaultValue={editingProperty?.state || ''} placeholder="Ex: RJ" className="w-full border rounded p-2" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">URL da Imagem</label>
                  <input name="image" defaultValue={editingProperty?.image || ''} placeholder="https://..." className="w-full border rounded p-2" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">URL do Tour Virtual (Opcional)</label>
                  <input name="virtualTourUrl" defaultValue={editingProperty?.virtualTourUrl || ''} placeholder="https://my.matterport.com/show/?m=..." className="w-full border rounded p-2" />
                </div>
                <div className="col-span-2 flex items-center gap-2 mt-2">
                  <input type="checkbox" id="featured" name="featured" defaultChecked={editingProperty?.featured || false} className="w-4 h-4 rounded border-gray-300" />
                  <label htmlFor="featured" className="text-sm font-medium">Destacar imóvel na página inicial</label>
                </div>
              </div>
              <div className="pt-4 border-t flex justify-end gap-3 mt-6">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Salvar Imóvel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
