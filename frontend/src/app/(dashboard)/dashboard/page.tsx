'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { TrendingUp, TrendingDown, CheckCircle } from 'lucide-react';

export default function DashboardPage() {
  const [balance, setBalance] = useState(0);
  const [entries, setEntries] = useState<any[]>([]);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [monthly, setMonthly] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checklist, setChecklist] = useState({
    hasEntry: false,
    hasCategory: false,
    hasPayable: false,
  });

  const [payables, setPayables] = useState<any[]>([]);
  const [receivables, setReceivables] = useState<any[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      const [b, e, m, cats, pays, recs] = await Promise.all([
        api.get('/entries/balance'),
        api.get('/entries', { params: { limit: 5 } }),
        api.get('/entries/monthly', { params: { month } }),
        api.get('/categories'),
        api.get('/payables'),
        api.get('/receivables'),
      ]);
      setBalance(b.data);
      setEntries(e.data.data || e.data);
      setMonthly(m.data);
      setPayables(pays.data || []);
      setReceivables(recs.data || []);
      setChecklist({
        hasEntry: (e.data.data || e.data).length > 0,
        hasCategory: cats.data.length > 0,
        hasPayable: pays.data.length > 0,
      });
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [month]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
        <div className="bg-white rounded-2xl p-8 border border-gray-100">
          <div className="h-4 bg-gray-200 rounded w-32 mb-4 animate-pulse" />
          <div className="h-12 bg-gray-200 rounded w-64 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Dashboard</h2>
          <p className="text-gray-500 mt-1">Visão geral das suas finanças</p>
        </div>
        <input type="month" value={month} onChange={e => setMonth(e.target.value)} className="px-4 py-2 border border-gray-200 rounded-xl" />
      </div>

      {/* Checklist */}
      {(!checklist.hasEntry || !checklist.hasCategory || !checklist.hasPayable) && (
        <div className="bg-green-50 border border-green-100 rounded-2xl p-6">
          <h3 className="font-medium text-gray-900 mb-3">Comece por aqui</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className={checklist.hasEntry ? 'text-primary' : 'text-gray-300'} />
              <span className={checklist.hasEntry ? 'text-gray-700' : 'text-gray-500'}>Lance o que entrou e saiu</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className={checklist.hasCategory ? 'text-primary' : 'text-gray-300'} />
              <span className={checklist.hasCategory ? 'text-gray-700' : 'text-gray-500'}>Crie categorias simples</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className={checklist.hasPayable ? 'text-primary' : 'text-gray-300'} />
              <span className={checklist.hasPayable ? 'text-gray-700' : 'text-gray-500'}>Anote o que você precisa pagar</span>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <p className="text-sm text-gray-500 uppercase tracking-wide">Saldo Atual</p>
        <p className={`text-5xl font-semibold mt-2 ${balance >= 0 ? 'text-primary' : 'text-red-500'}`}>
          R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
      </div>

      {monthly && (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <p className="text-sm text-gray-500">Entradas do mês</p>
            <p className="text-3xl font-semibold text-primary mt-2">R$ {monthly.entradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <p className="text-sm text-gray-500">Saídas do mês</p>
            <p className="text-3xl font-semibold text-red-500 mt-2">R$ {monthly.saidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <p className="text-sm text-gray-500">Saldo do mês</p>
            <p className={`text-3xl font-semibold mt-2 ${monthly.saldo >= 0 ? 'text-primary' : 'text-red-500'}`}>
              R$ {monthly.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">A pagar</h3>
            <span className="text-sm text-gray-500">{payables.filter(p => p.status === 'pendente').length} pendente(s)</span>
          </div>
          {payables.filter(p => p.status === 'pendente').length === 0 ? (
            <p className="text-sm text-gray-500">Nenhuma conta pendente.</p>
          ) : (
            <div className="space-y-2">
              {payables.filter(p => p.status === 'pendente').slice(0, 4).map(p => (
                <div key={p._id} className="flex justify-between text-sm">
                  <span className="truncate">{p.description}</span>
                  <span className="text-red-500 font-medium">R$ {p.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">A receber</h3>
            <span className="text-sm text-gray-500">{receivables.filter(r => r.status === 'pendente').length} pendente(s)</span>
          </div>
          {receivables.filter(r => r.status === 'pendente').length === 0 ? (
            <p className="text-sm text-gray-500">Nenhuma conta pendente.</p>
          ) : (
            <div className="space-y-2">
              {receivables.filter(r => r.status === 'pendente').slice(0, 4).map(r => (
                <div key={r._id} className="flex justify-between text-sm">
                  <span className="truncate">{r.description}</span>
                  <span className="text-primary font-medium">R$ {r.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-medium text-gray-900 mb-4">Últimos lançamentos</h3>
        {entries.length === 0 ? (
          <p className="text-gray-500 text-sm">Nenhum lançamento ainda. Comece cadastrando uma entrada ou saída.</p>
        ) : (
          <div className="space-y-3">
            {entries.map((e) => (
              <div key={e._id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  {e.type === 'entrada' ? <TrendingUp className="text-primary" size={20} /> : <TrendingDown className="text-red-400" size={20} />}
                  <div>
                    <p className="font-medium text-gray-900">{e.description}</p>
                    <p className="text-xs text-gray-500">{new Date(e.date).toLocaleDateString('pt-BR')} • {e.category}</p>
                  </div>
                </div>
                <span className={`font-medium ${e.type === 'entrada' ? 'text-primary' : 'text-red-500'}`}>
                  {e.type === 'entrada' ? '+' : '-'} R$ {e.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
