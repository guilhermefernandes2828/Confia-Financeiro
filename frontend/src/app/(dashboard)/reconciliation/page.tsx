'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';

export default function ReconciliationPage() {
  const [data, setData] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const load = async () => {
    const res = await api.get('/reconciliation/pending');
    setData(res.data);
  };

  useEffect(() => { load(); }, []);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setMessage('');
    const formData = new FormData();
    formData.append('file', file);
    try {
      await api.post('/reconciliation/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMessage('Arquivo importado e matches sugeridos com sucesso!');
      setFile(null);
      load();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Erro na importação');
    }
    setLoading(false);
  };

  const handleManualMatch = async (bankTxId: string, entryId: string) => {
    try {
      await api.post('/reconciliation/match', { bankTxId, entryId });
      load();
    } catch (err) {
      alert('Erro ao conciliar');
    }
  };

  if (!data) return (
    <div className="space-y-4">
      <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="h-4 bg-gray-200 rounded w-32 mb-4 animate-pulse" />
        <div className="h-10 bg-gray-100 rounded animate-pulse" />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Conciliação Bancária</h2>
        <p className="text-gray-500 mt-1">Importe extratos e concilie com seus lançamentos</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-medium mb-4">Importar Extrato (OFX ou CSV)</h3>
        <div className="flex items-center gap-4 flex-wrap">
          <label className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl text-sm font-medium cursor-pointer">
            <Upload size={16} /> Escolher arquivo
            <input type="file" accept=".ofx,.csv,.xml" onChange={e => setFile(e.target.files?.[0] || null)} className="hidden" />
          </label>
          {file && <span className="text-sm text-gray-600">{file.name}</span>}
          <button onClick={handleUpload} disabled={!file || loading} className="flex items-center gap-2 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-medium">
            {loading ? 'Importando...' : 'Importar'}
          </button>
        </div>
        {message && <p className="mt-3 text-sm text-primary">{message}</p>}
        <p className="text-xs text-gray-400 mt-3">Importe um arquivo OFX ou CSV do seu banco para começar a conciliar. CSV esperado: data,descrição,valor</p>
      </div>

      <div className={`bg-white rounded-2xl shadow-sm border p-6 flex items-center gap-4 ${data.isReconciled ? 'border-primary/30 bg-green-50/50' : 'border-gray-100'}`}>
        {data.isReconciled ? <CheckCircle className="text-primary" size={32} /> : <AlertCircle className="text-amber-500" size={32} />}
        <div>
          <p className="font-medium">{data.isReconciled ? 'Saldo conciliado!' : 'Pendências de conciliação'}</p>
          <p className="text-sm text-gray-500">
            Sistema: R$ {data.systemBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} | 
            Banco: R$ {data.bankBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Pendentes no Banco</h3>
            {data.pendingBank.length > 0 && (
              <button
                onClick={async () => {
                  if (confirm('Deseja limpar todas as transações pendentes do banco?')) {
                    alert('Funcionalidade de limpeza será adicionada em breve.');
                  }
                }}
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                Limpar todos
              </button>
            )}
          </div>
          {data.pendingBank.length === 0 ? <p className="text-sm text-gray-500">Nenhuma transação pendente.</p> : (
            <div className="space-y-3">
              {data.pendingBank.map((tx: any) => (
                <div key={tx._id} className="flex justify-between items-start text-sm border-b border-gray-50 pb-3">
                  <div>
                    <p className="font-medium">{tx.description}</p>
                    <p className="text-xs text-gray-500">{new Date(tx.date).toLocaleDateString('pt-BR')} • {tx.type}</p>
                  </div>
                  <span className={tx.type === 'entrada' ? 'text-primary' : 'text-red-500'}>
                    R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-medium mb-4 text-gray-900">Pendentes no Sistema</h3>
          {data.pendingEntries.length === 0 ? <p className="text-sm text-gray-500">Nenhum lançamento pendente.</p> : (
            <div className="space-y-3">
              {data.pendingEntries.map((e: any) => (
                <div key={e._id} className="flex justify-between items-start text-sm border-b border-gray-50 pb-3">
                  <div>
                    <p className="font-medium">{e.description}</p>
                    <p className="text-xs text-gray-500">{new Date(e.date).toLocaleDateString('pt-BR')} • {e.category}</p>
                  </div>
                  <span className={e.type === 'entrada' ? 'text-primary' : 'text-red-500'}>
                    R$ {e.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {data.pendingBank.length > 0 && data.pendingEntries.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-medium mb-4">Conciliação Manual</h3>
          <p className="text-sm text-gray-500 mb-4">Selecione uma transação do banco e um lançamento para conciliar manualmente.</p>
          <ManualMatcher pendingBank={data.pendingBank} pendingEntries={data.pendingEntries} onMatch={handleManualMatch} />
        </div>
      )}
    </div>
  );
}

function ManualMatcher({ pendingBank, pendingEntries, onMatch }: any) {
  const [selectedBank, setSelectedBank] = useState('');
  const [selectedEntry, setSelectedEntry] = useState('');

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-end">
      <div className="flex-1">
        <label className="text-xs text-gray-500">Transação Banco</label>
        <select value={selectedBank} onChange={e => setSelectedBank(e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm">
          <option value="">Selecione...</option>
          {pendingBank.map((tx: any) => (
            <option key={tx._id} value={tx._id}>{tx.description} - R$ {tx.amount}</option>
          ))}
        </select>
      </div>
      <div className="flex-1">
        <label className="text-xs text-gray-500">Lançamento Sistema</label>
        <select value={selectedEntry} onChange={e => setSelectedEntry(e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm">
          <option value="">Selecione...</option>
          {pendingEntries.map((e: any) => (
            <option key={e._id} value={e._id}>{e.description} - R$ {e.amount}</option>
          ))}
        </select>
      </div>
      <button
        disabled={!selectedBank || !selectedEntry}
        onClick={() => { onMatch(selectedBank, selectedEntry); setSelectedBank(''); setSelectedEntry(''); }}
        className="bg-primary text-white px-4 py-2 rounded-xl text-sm disabled:opacity-50"
      >
        Conciliar
      </button>
    </div>
  );
}
