'use client';

import api from '@/lib/api';
import { Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

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
  const [allFiltered, setAllFiltered] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [filters, setFilters] = useState({
    from: '',
    to: '',
    type: '',
    search: '',
    category: '',
  });
  const [form, setForm] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    type: 'entrada',
    category: '',
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const params: any = { page, limit: 15 };
    if (filters.from) params.from = filters.from;
    if (filters.to) params.to = filters.to;
    if (filters.type) params.type = filters.type;
    if (filters.search) params.search = filters.search;
    if (filters.category) params.category = filters.category;

    const [pageRes, allRes] = await Promise.all([
      api.get('/entries', { params }),
      api.get('/entries', { params: { ...params, page: 1, limit: 1000 } }),
    ]);

    setEntries(pageRes.data.data || []);
    setTotal(pageRes.data.total || 0);
    setAllFiltered(allRes.data.data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [filters, page]);

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data));
  }, []);

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
    setForm({
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      type: 'entrada',
      category: '',
    });
    load();
  };

  const handleEdit = (entry: any) => {
    setEditing(entry);
    setForm({
      description: entry.description,
      amount: entry.amount.toFixed(2).replace('.', ','),
      date: new Date(entry.date).toISOString().split('T')[0],
      type: entry.type,
      category: entry.category || '',
    });
    setShowForm(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await api.delete(`/entries/${deleteTarget._id}`);
    setDeleteTarget(null);
    load();
  };

  const deleteSelected = async () => {
    if (selected.length === 0) return;
    if (!confirm(`Excluir ${selected.length} lançamento(s)?`)) return;
    for (const id of selected) {
      await api.delete(`/entries/${id}`);
    }
    setSelected([]);
    load();
  };

  const exportCSV = async () => {
    const params: any = { limit: 1000 };
    if (filters.from) params.from = filters.from;
    if (filters.to) params.to = filters.to;
    if (filters.type) params.type = filters.type;
    if (filters.search) params.search = filters.search;
    if (filters.category) params.category = filters.category;
    const res = await api.get('/entries', { params });
    const allEntries = res.data.data || [];

    const grouped: any = {};
    allEntries.forEach((e: any) => {
      const cat = e.category || 'Sem categoria';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(e);
    });

    let csv = 'Categoria,Data,Descrição,Tipo,Valor,Conciliado\n';
    let totalEntradas = 0;
    let totalSaidas = 0;

    Object.keys(grouped)
      .sort()
      .forEach(cat => {
        csv += `\n"${cat}"\n`;
        grouped[cat].forEach((e: any) => {
          csv += `"${cat}",${new Date(e.date).toLocaleDateString('pt-BR')},"${e.description}",${e.type.toUpperCase()},${e.amount.toFixed(2).replace('.', ',')},${e.reconciled ? 'Sim' : 'Não'}\n`;
          if (e.type === 'entrada') totalEntradas += e.amount;
          else totalSaidas += e.amount;
        });
      });

    csv += `\nTOTAL ENTRADAS,,${totalEntradas.toFixed(2).replace('.', ',')}\n`;
    csv += `TOTAL SAÍDAS,,${totalSaidas.toFixed(2).replace('.', ',')}\n`;
    csv += `SALDO,,${(totalEntradas - totalSaidas).toFixed(2).replace('.', ',')}\n`;

    const blob = new Blob(['\uFEFF' + csv], {
      type: 'text/csv;charset=utf-8;',
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `lancamentos-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const exportPDF = () => {
    window.print();
  };

  const totalPages = Math.ceil(total / 15);

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-semibold text-gray-900'>Lançamentos</h2>
          <p className='text-gray-500 mt-1'>Controle de entradas e saídas</p>
        </div>
        {!showForm && (
          <div className='flex gap-2'>
            <button
              onClick={exportCSV}
              className='border border-gray-200 px-4 py-2 rounded-xl text-sm'
            >
              Exportar CSV
            </button>
            <button
              onClick={exportPDF}
              className='border border-gray-200 px-4 py-2 rounded-xl text-sm'
            >
              Exportar PDF
            </button>
            {selected.length > 0 && (
              <button
                onClick={deleteSelected}
                className='bg-red-500 text-white px-4 py-2 rounded-xl text-sm'
              >
                Excluir selecionados
              </button>
            )}
            <button
              onClick={() => {
                setShowForm(true);
                setEditing(null);
                setForm({
                  description: '',
                  amount: '',
                  date: new Date().toISOString().split('T')[0],
                  type: 'entrada',
                  category: '',
                });
              }}
              className='flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl text-sm font-medium'
            >
              <Plus size={18} /> Novo
            </button>
          </div>
        )}
      </div>

      {showForm && (
        <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6'>
          <div className='flex items-center gap-2 text-sm text-gray-500 mb-4'>
            <button
              onClick={() => setShowForm(false)}
              className='hover:text-primary'
            >
              Lançamentos
            </button>
            <span>/</span>
            <span>{editing ? 'Editar' : 'Novo'}</span>
          </div>
          <form
            onSubmit={handleSubmit}
            className='grid grid-cols-1 md:grid-cols-2 gap-4'
          >
            <input
              placeholder='Descrição'
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className='px-4 py-3 border border-gray-200 rounded-xl'
              required
            />
            <div className='relative'>
              <span className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm'>
                R$
              </span>
              <input
                placeholder='0,00'
                value={form.amount}
                onChange={e =>
                  setForm({ ...form, amount: maskCurrency(e.target.value) })
                }
                className='w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl'
                required
              />
            </div>
            <input
              type='date'
              value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })}
              className='px-4 py-3 border border-gray-200 rounded-xl'
              required
            />
            <select
              value={form.type}
              onChange={e => setForm({ ...form, type: e.target.value })}
              className='px-4 py-3 border border-gray-200 rounded-xl bg-white'
            >
              <option value='entrada'>Entrada</option>
              <option value='saida'>Saída</option>
            </select>
            <select
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              className='px-4 py-3 border border-gray-200 rounded-xl md:col-span-2 bg-white'
            >
              <option value=''>Selecione a categoria</option>
              {categories.map(c => (
                <option key={c._id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            <div className='md:col-span-2 flex gap-3'>
              <button
                type='submit'
                className='bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-medium'
              >
                Salvar
              </button>
              <button
                type='button'
                onClick={() => setShowForm(false)}
                className='border border-gray-200 px-6 py-2.5 rounded-xl text-sm'
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {!showForm && (
        <>
          <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-5'>
            <div className='flex flex-wrap gap-4 items-end'>
              <div className='flex-1 min-w-[140px]'>
                <label className='block text-xs font-medium text-gray-500 mb-1'>
                  De
                </label>
                <input
                  type='date'
                  value={filters.from}
                  onChange={e =>
                    setFilters({ ...filters, from: e.target.value })
                  }
                  className='w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm'
                />
              </div>
              <div className='flex-1 min-w-[140px]'>
                <label className='block text-xs font-medium text-gray-500 mb-1'>
                  Até
                </label>
                <input
                  type='date'
                  value={filters.to}
                  onChange={e => setFilters({ ...filters, to: e.target.value })}
                  className='w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm'
                />
              </div>
              <div className='flex-1 min-w-[140px]'>
                <label className='block text-xs font-medium text-gray-500 mb-1'>
                  Tipo
                </label>
                <select
                  value={filters.type}
                  onChange={e =>
                    setFilters({ ...filters, type: e.target.value })
                  }
                  className='w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white'
                >
                  <option value=''>Todos</option>
                  <option value='entrada'>Entrada</option>
                  <option value='saida'>Saída</option>
                </select>
              </div>
              <div className='flex-1 min-w-[140px]'>
                <label className='block text-xs font-medium text-gray-500 mb-1'>
                  Categoria
                </label>
                <select
                  value={filters.category}
                  onChange={e =>
                    setFilters({ ...filters, category: e.target.value })
                  }
                  className='w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white'
                >
                  <option value=''>Todas</option>
                  {categories.map(c => (
                    <option key={c._id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className='flex-1 min-w-[180px]'>
                <label className='block text-xs font-medium text-gray-500 mb-1'>
                  Buscar
                </label>
                <div className='relative'>
                  <Search
                    size={16}
                    className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
                  />
                  <input
                    placeholder='Descrição...'
                    value={filters.search}
                    onChange={e =>
                      setFilters({ ...filters, search: e.target.value })
                    }
                    className='w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm'
                  />
                </div>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
            {loading ? (
              <div className='p-6 space-y-3'>
                {[1, 2, 3].map(i => (
                  <div
                    key={i}
                    className='h-10 bg-gray-100 rounded animate-pulse'
                  />
                ))}
              </div>
            ) : entries.length === 0 ? (
              <p className='text-center text-gray-500 py-12'>
                Nenhum lançamento encontrado. Crie o primeiro para começar a
                controlar suas finanças.
              </p>
            ) : (
              <>
                {/* Totais (todos os registros do filtro) */}
                <div className='grid grid-cols-3 gap-4 p-5 border-b border-gray-100 bg-gray-50/50'>
                  <div>
                    <p className='text-xs text-gray-500 uppercase'>Entradas</p>
                    <p className='text-lg font-semibold text-primary'>
                      R${' '}
                      {allFiltered
                        .filter(e => e.type === 'entrada')
                        .reduce((s, e) => s + e.amount, 0)
                        .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className='text-xs text-gray-500 uppercase'>Saídas</p>
                    <p className='text-lg font-semibold text-red-500'>
                      R${' '}
                      {allFiltered
                        .filter(e => e.type === 'saida')
                        .reduce((s, e) => s + e.amount, 0)
                        .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className='text-xs text-gray-500 uppercase'>Saldo</p>
                    <p
                      className={`text-lg font-semibold ${allFiltered.reduce((s, e) => s + (e.type === 'entrada' ? e.amount : -e.amount), 0) >= 0 ? 'text-primary' : 'text-red-500'}`}
                    >
                      R${' '}
                      {allFiltered
                        .reduce(
                          (s, e) =>
                            s + (e.type === 'entrada' ? e.amount : -e.amount),
                          0
                        )
                        .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                <table className='w-full'>
                  <thead className='bg-gray-50 text-left text-xs text-gray-500 uppercase'>
                    <tr>
                      <th className='px-4 py-3 w-10'></th>
                      <th className='px-6 py-3'>Data</th>
                      <th className='px-6 py-3'>Descrição</th>
                      <th className='px-6 py-3'>Categoria</th>
                      <th className='px-6 py-3'>Tipo</th>
                      <th className='px-6 py-3 text-center'>Conciliado</th>
                      <th className='px-6 py-3 text-right'>Valor</th>
                      <th className='px-6 py-3'></th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-100'>
                    {entries.map(e => (
                      <tr
                        key={e._id}
                        onClick={() => handleEdit(e)}
                        className={`cursor-pointer hover:bg-gray-50 ${!e.reconciled ? 'bg-yellow-50/70' : ''}`}
                      >
                        <td
                          className='px-4 py-4'
                          onClick={ev => ev.stopPropagation()}
                        >
                          <input
                            type='checkbox'
                            checked={selected.includes(e._id)}
                            onChange={() =>
                              setSelected(s =>
                                s.includes(e._id)
                                  ? s.filter(x => x !== e._id)
                                  : [...s, e._id]
                              )
                            }
                          />
                        </td>
                        <td className='px-6 py-4 text-sm'>
                          {new Date(e.date).toLocaleDateString('pt-BR')}
                        </td>
                        <td className='px-6 py-4 text-sm font-medium'>
                          {e.description}
                        </td>
                        <td className='px-6 py-4 text-sm'>
                          <div className='flex items-center gap-2'>
                            <div
                              className='w-3 h-3 rounded-full shrink-0'
                              style={{
                                backgroundColor:
                                  categories.find(c => c.name === e.category)
                                    ?.color || '#9CA3AF',
                              }}
                            />
                            <span className='text-gray-700'>
                              {e.category || '—'}
                            </span>
                          </div>
                        </td>
                        <td className='px-6 py-4 text-sm'>
                          <span className={`text-gray-700}`}>{e.type}</span>
                        </td>
                        <td className='px-6 py-4 text-center'>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${e.reconciled ? 'bg-green-50 text-primary font-bold' : 'bg-red-50 text-red-500'}`}
                          >
                            {e.reconciled ? 'Sim' : 'Não'}
                          </span>
                        </td>
                        <td
                          className={`px-6 py-4 text-sm text-right font-medium ${e.type === 'entrada' ? 'text-primary' : 'text-red-500'}`}
                        >
                          R${' '}
                          {e.amount.toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td
                          className='px-6 py-4 text-right'
                          onClick={ev => ev.stopPropagation()}
                        >
                          <button
                            onClick={() => setDeleteTarget(e)}
                            className='text-gray-400 hover:text-red-500'
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {totalPages > 1 && (
                  <div className='flex justify-center gap-2 py-4 border-t'>
                    <button
                      disabled={page === 1}
                      onClick={() => setPage(p => p - 1)}
                      className='px-3 py-1 border rounded disabled:opacity-50'
                    >
                      Anterior
                    </button>
                    <span className='px-3 py-1 text-sm'>
                      Página {page} de {totalPages}
                    </span>
                    <button
                      disabled={page === totalPages}
                      onClick={() => setPage(p => p + 1)}
                      className='px-3 py-1 border rounded disabled:opacity-50'
                    >
                      Próxima
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}

      {deleteTarget && (
        <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4'>
          <div className='bg-white rounded-2xl p-6 max-w-md w-full shadow-xl'>
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>
              Excluir lançamento
            </h3>
            <p className='text-gray-600 mb-6'>
              Deseja excluir esse lançamento “{deleteTarget.description}”?
            </p>
            <div className='flex gap-3 justify-end'>
              <button
                onClick={() => setDeleteTarget(null)}
                className='px-4 py-2 border border-gray-200 rounded-xl text-sm'
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className='px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium'
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
