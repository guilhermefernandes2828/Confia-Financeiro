'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Plus, Trash2 } from 'lucide-react';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#10B981');
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  const load = async () => {
    const res = await api.get('/categories');
    setCategories(res.data);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      await api.put(`/categories/${editing._id}`, { name, color });
    } else {
      await api.post('/categories', { name, color });
    }
    setShowForm(false);
    setEditing(null);
    setName('');
    setColor('#10B981');
    load();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await api.delete(`/categories/${deleteTarget._id}`);
    setDeleteTarget(null);
    load();
  };

  const startEdit = (c: any) => {
    setEditing(c);
    setName(c.name);
    setColor(c.color);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Categorias</h2>
          <p className="text-gray-500 mt-1">Organize lançamentos, contas a pagar e a receber</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditing(null); setName(''); setColor('#10B981'); }} className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl text-sm font-medium">
          <Plus size={18} /> Nova
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-medium mb-4">{editing ? 'Editar' : 'Nova'} Categoria</h3>
          <form onSubmit={handleSubmit} className="flex gap-4 items-end flex-wrap">
            <input placeholder="Nome" value={name} onChange={e => setName(e.target.value)} className="flex-1 min-w-[200px] px-4 py-3 border border-gray-200 rounded-xl" required />
            <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-16 h-12 border border-gray-200 rounded-xl" />
            <button type="submit" className="bg-primary text-white px-6 py-3 rounded-xl text-sm">Salvar</button>
            <button type="button" onClick={() => setShowForm(false)} className="border border-gray-200 px-6 py-3 rounded-xl text-sm">Cancelar</button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {categories.length === 0 ? (
          <p className="text-center text-gray-500 py-12">Nenhuma categoria. Crie algumas para organizar melhor.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {categories.map(c => (
              <div key={c._id} onClick={() => startEdit(c)} className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="font-medium">{c.name}</span>
                </div>
                <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(c); }} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Excluir categoria</h3>
            <p className="text-gray-600 mb-6">Deseja excluir a categoria “{deleteTarget.name}”?</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 border border-gray-200 rounded-xl text-sm">Cancelar</button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
