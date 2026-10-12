'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Plus, Check, Trash2 } from 'lucide-react';

function maskCurrency(value: string) {
  const digits = value.replace(/\D/g, '');
  const number = (parseInt(digits || '0', 10) / 100).toFixed(2);
  return number.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function parseCurrency(value: string) {
  return parseFloat(value.replace(/\./g, '').replace(',', '.')) || 0;
}

export default function ReceivablesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ description: '', amount: '', expectedDate: new Date().toISOString().split('T')[0], categoryId: '' });
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  const load = async () => {
    const [r, c] = await Promise.all([api.get('/receivables'), api.get('/categories')]);
    setItems(r.data);
    setCategories(c.data);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/receivables', { ...form, amount: parseCurrency(form.amount) });
    setShowForm(false);
    setForm({ description: '', amount: '', expectedDate: new Date().toISOString().split('T')[0], categoryId: '' });
    load();
  };

  const markReceived = async (id: string) => {
    await api.put(`/receivables/${id}/receive`);
    load();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await api.delete(`/receivables/${deleteTarget._id}`);
    setDeleteTarget(null);
    load();
  };

  const isAlert = (date: string, status: string) => {
    if (status !== 'pendente') return false;
    const d = new Date(date);
    const now = new Date();
    const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Contas a Receber</h2>
          <p className="text-gray-500 mt-1">O que você tem a receber</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl text-sm font-medium">
          <Plus size={18} /> Nova
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Descrição" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="px-4 py-3 border border-gray-200 rounded-xl" required />
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R$</span>
              <input placeholder="0,00" value={form.amount} onChange={e => setForm({...form, amount: maskCurrency(e.target.value)})} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl" required />
            </div>
            <input type="date" value={form.expectedDate} onChange={e => setForm({...form, expectedDate: e.target.value})} className="px-4 py-3 border border-gray-200 rounded-xl" required />
            <select value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})} className="px-4 py-3 border border-gray-200 rounded-xl bg-white">
              <option value="">Sem categoria</option>
              {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="bg-primary text-white px-6 py-2 rounded-xl text-sm">Salvar</button>
              <button type="button" onClick={() => setShowForm(false)} className="border border-gray-200 px-6 py-2 rounded-xl text-sm">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {items.length === 0 ? (
          <p className="text-center text-gray-500 py-12">Nenhuma conta a receber. Anote o que clientes ainda vão te pagar.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {items.map(item => (
              <div key={item._id} className={`flex items-center justify-between px-6 py-4 ${isAlert(item.expectedDate, item.status) ? 'bg-yellow-50' : ''}`}>
                <div>
                  <p className="font-medium">{item.description}</p>
                  <p className="text-sm text-gray-500">
                    Previsto para {new Date(item.expectedDate).toLocaleDateString('pt-BR')} • R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    {item.status === 'recebido' && ' • Recebido'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {item.status === 'pendente' && (
                    <button onClick={() => markReceived(item._id)} className="text-primary hover:bg-green-50 p-2 rounded-lg" title="Marcar como recebido"><Check size={18} /></button>
                  )}
                  <button onClick={() => setDeleteTarget(item)} className="text-gray-400 hover:text-red-500 p-2"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Excluir conta</h3>
            <p className="text-gray-600 mb-6">Deseja excluir “{deleteTarget.description}”?</p>
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
