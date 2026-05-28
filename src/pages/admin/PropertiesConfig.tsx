import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { Property } from "../../types";
import { formatCurrency } from "../../utils";

export default function PropertiesConfig() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      featured: data.featured === 'on'
    };

    fetch('/api/properties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(() => {
      setIsModalOpen(false);
      loadProperties();
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Gestão de Imóveis</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Novo Imóvel
        </button>
      </div>

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
                <tr><td colSpan={6} className="p-4 text-center">Carregando...</td></tr>
              ) : properties.map(p => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="p-4 text-gray-500">#{p.id}</td>
                  <td className="p-4">
                    <img src={p.image || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=100"} alt="Thumb" className="w-12 h-12 rounded object-cover" />
                  </td>
                  <td className="p-4 font-medium max-w-[200px] truncate">{p.title}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs uppercase font-semibold ${p.status === 'venda' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-4">{formatCurrency(p.price)}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:bg-red-50 p-2 rounded transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold">Adicionar Imóvel</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-900">&times;</button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Título</label>
                  <input required name="title" className="w-full border rounded p-2" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Descrição</label>
                  <textarea required name="description" rows={3} className="w-full border rounded p-2"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Preço (R$)</label>
                  <input required type="number" step="0.01" name="price" className="w-full border rounded p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tipo</label>
                  <select name="type" className="w-full border rounded p-2 bg-white">
                    <option value="apartamento">Apartamento</option>
                    <option value="casa">Casa</option>
                    <option value="terreno">Terreno</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Finalidade</label>
                  <select name="status" className="w-full border rounded p-2 bg-white">
                    <option value="venda">Venda</option>
                    <option value="locacao">Locação</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Quartos</label>
                  <input required type="number" name="bedrooms" defaultValue={1} className="w-full border rounded p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Banheiros</label>
                  <input required type="number" name="bathrooms" defaultValue={1} className="w-full border rounded p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Área (m²)</label>
                  <input required type="number" name="area" defaultValue={50} className="w-full border rounded p-2" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">URL da Imagem</label>
                  <input name="image" placeholder="https://..." className="w-full border rounded p-2" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">URL do Tour Virtual (Opcional)</label>
                  <input name="virtualTourUrl" placeholder="https://my.matterport.com/show/?m=..." className="w-full border rounded p-2" />
                </div>
                <div className="col-span-2 flex items-center gap-2 mt-2">
                  <input type="checkbox" id="featured" name="featured" className="w-4 h-4 rounded border-gray-300" />
                  <label htmlFor="featured" className="text-sm font-medium">Destacar imóvel na página inicial</label>
                </div>
              </div>
              <div className="pt-4 border-t flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Salvar Imóvel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
