'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function DashboardPage() {
  const [balance, setBalance] = useState(0);
  const [entries, setEntries] = useState<any[]>([]);

  useEffect(() => {
    api.get('/entries/balance').then(res => setBalance(res.data));
    api.get('/entries').then(res => setEntries(res.data.slice(0, 5)));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Dashboard</h2>
        <p className="text-gray-500 mt-1">Visão geral das suas finanças</p>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <p className="text-sm text-gray-500 uppercase tracking-wide">Saldo Atual</p>
        <p className={`text-5xl font-semibold mt-2 ${balance >= 0 ? 'text-primary' : 'text-red-500'}`}>
          R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-medium text-gray-900 mb-4">Últimos lançamentos</h3>
        {entries.length === 0 ? (
          <p className="text-gray-500 text-sm">Nenhum lançamento ainda.</p>
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
