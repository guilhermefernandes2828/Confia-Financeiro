'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Plus, Trash2 } from 'lucide-react';

function maskCurrency(value: string) {
  const digits = value.replace(/\D/g, '');
  const number = (parseInt(digits || '0', 10) / 100).toFixed(2);
  return number.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function parseCurrency(value: string) {
  return parseFloat(value.replace(/\./g, '').replace(',', '.')) || 0;
}

export default function EntriesPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [filters, setFilters] = useState({ from: '', to: '', type: '' });
  const [form, setForm] = useState({ description: '', amount: '', date: '', type: 'entrada', category: '' });
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  const load = async () => {
    const params: any = {};
    if (filters.from) params.from = filters.from;
    if (filters.to) params.to = filters.to;
    if (filters.type) params.type = filters.type;
    const res = await api.get('/entries', { params });
    setEntries(res.data);
  };

  useEffect(() => { load(); }, [filters]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form, amount: parseCurrency(form.amount) };
    if (editing) {
      await api.put(`/entries/${editing._id}`, data);
    } else {
      await api.post('/entries', data);
    }
    setShowForm(false);
    setEditing(null);
    setForm({ description: '', amount: '', date: '', type: 'entrada', category: '' });
    load();
  };

  const handleEdit = (entry: any) => {
    setEditing(entry);
    setForm({
      description: entry.description,
      amount: entry.amount.toFixed(2).replace('.', ','),
      date: new Date(entry.date).toISOString().split('T')[0],
      type: entry.type,
      category: entry.category,
    });
    setShowForm(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await api.delete(`/entries/${deleteTarget._id}`);
    setDeleteTarget(null);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Lançamentos</h2>
          <p className="text-gray-500 mt-1">Controle de entradas e saídas</p>
        </div>
        {!showForm && (
          <button onClick={() => { setShowForm(true); setEditing(null); setForm({ description: '', amount: '', date: '', type: 'entrada', category: '' }); }} className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl text-sm font-medium">
            <Plus size={18} /> Novo
          </button>
        )}
      </div>

      {!showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs font-medium text-gray-500 mb-1">De</label>
              <input type="date" value={filters.from} onChange={e => setFilters({...filters, from: e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs font-medium text-gray-500 mb-1">Até</label>
              <input type="date" value={filters.to} onChange={e => setFilters({...filters, to: e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs font-medium text-gray-500 mb-1">Tipo</label>
              <select value={filters.type} onChange={e => setFilters({...filters, type: e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white">
                <option value="">Todos</option>
                <option value="entrada">Entrada</option>
                <option value="saida">Saída</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-medium mb-4">{editing ? 'Editar' : 'Novo'} Lançamento</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Descrição" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" required />
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R$</span>
              <input
                placeholder="0,00"
                value={form.amount}
                onChange={e => setForm({...form, amount: maskCurrency(e.target.value)})}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>
            <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" required />
            <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white">
              <option value="entrada">Entrada</option>
              <option value="saida">Saída</option>
            </select>
            <input placeholder="Categoria" value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="px-4 py-3 border border-gray-200 rounded-xl md:col-span-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" required />
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-medium">Salvar</button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="border border-gray-200 px-6 py-2.5 rounded-xl text-sm">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {!showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-3">Data</th>
                <th className="px-6 py-3">Descrição</th>
                <th className="px-6 py-3">Categoria</th>
                <th className="px-6 py-3">Tipo</th>
                <th className="px-6 py-3 text-right">Valor</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {entries.map(e => (
                <tr
                  key={e._id}
                  onClick={() => handleEdit(e)}
                  className={`cursor-pointer hover:bg-gray-50 transition-colors ${!e.reconciled ? 'bg-yellow-50/70' : ''}`}
                >
                  <td className="px-6 py-4 text-sm">{new Date(e.date).toLocaleDateString('pt-BR')}</td>
                  <td className="px-6 py-4 text-sm font-medium">{e.description}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{e.category}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`font-bold uppercase ${e.type === 'entrada' ? 'text-primary' : 'text-red-500'}`}>
                      {e.type}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-sm text-right font-medium ${e.type === 'entrada' ? 'text-primary' : 'text-red-500'}`}>
                    R$ {e.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-right" onClick={(ev) => ev.stopPropagation()}>
                    <button onClick={() => setDeleteTarget(e)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {entries.length === 0 && <p className="text-center text-gray-500 py-12">Nenhum lançamento encontrado.</p>}
        </div>
      )}

      {/* Modal de exclusão */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Excluir lançamento</h3>
            <p className="text-gray-600 mb-6">
              Deseja excluir esse lançamento <span className="font-medium">“{deleteTarget.description}”</span>?
            </p>
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
