'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle, Shield, FileText, TrendingUp, ArrowRight, Instagram } from 'lucide-react';

export default function LandingPage() {
  const [form, setForm] = useState({ name: '', email: '', feature: '', help: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simula envio (pode integrar com API depois)
    console.log('Sugestão enviada:', form);
    setSubmitted(true);
    setForm({ name: '', email: '', feature: '', help: '' });
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/icon.jpg" alt="Confia Financeiro" className="w-9 h-9 rounded-full" />
            <span className="text-xl font-semibold text-gray-900">Confia Financeiro</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-gray-600 hover:text-primary">Entrar</Link>
            <Link href="/register" className="bg-primary hover:bg-primary-dark text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
              Começar grátis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-green-50 text-primary text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          <Shield size={16} /> Dados estáveis e confiáveis
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-gray-900 leading-tight max-w-4xl mx-auto">
          Controle financeiro em que você pode confiar
        </h1>
        <p className="mt-6 text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
          Lançamentos estáveis e conciliação bancária por arquivo, sem dados que somem ou fiquem errados.
        </p>
        <div className="mt-10">
          <Link href="/register" className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-medium px-8 py-4 rounded-2xl text-lg transition-colors">
            Quero testar <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* O Problema */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-semibold text-center text-gray-900 mb-4">O problema</h2>
          <p className="text-center text-gray-500 mb-12 max-w-xl mx-auto">Problemas comuns que fazem o controle financeiro virar retrabalho.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Lançamentos que somem', desc: 'Ou mudam sozinhos sem explicação.' },
              { title: 'Conciliação que duplica', desc: 'Valores repetidos e saldo distorcido.' },
              { title: 'Saldo que não bate', desc: 'Sistema e banco nunca concordam.' },
              { title: 'Retrabalho constante', desc: 'Horas perdidas corrigindo erros.' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mb-4">
                  <span className="text-red-500 text-lg">!</span>
                </div>
                <h3 className="font-medium text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recursos atuais */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-semibold text-center text-gray-900 mb-4">O que já funciona</h2>
          <p className="text-center text-gray-500 mb-12">Recursos estáveis, prontos para uso.</p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center mb-6">
                <FileText className="text-primary" size={24} />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-3">Lançamentos estáveis</h3>
              <p className="text-gray-500">Cadastre entradas e saídas com segurança. Os dados não somem nem alteram sozinhos.</p>
            </div>
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center mb-6">
                <CheckCircle className="text-primary" size={24} />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-3">Conciliação por arquivo</h3>
              <p className="text-gray-500">Importe OFX ou CSV, compare com seus lançamentos e concilie sem duplicações.</p>
            </div>
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center mb-6">
                <TrendingUp className="text-primary" size={24} />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-3">Saldo confiável</h3>
              <p className="text-gray-500">Veja o saldo real da empresa, sempre atualizado e alinhado com a realidade.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Output para o usuário */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-semibold text-gray-900 mb-4">O que você já consegue ter</h2>
          <div className="mt-10 grid sm:grid-cols-2 gap-4 text-left">
            {[
              'Lançamentos organizados e estáveis',
              'Conciliação feita com o extrato do banco',
              'Saldo em que pode confiar',
              'Menos tempo gasto corrigindo erros',
              'Visão clara do que entrou e saiu',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 bg-white rounded-xl p-4 border border-gray-100">
                <CheckCircle className="text-primary mt-0.5 shrink-0" size={20} />
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Próxima funcionalidade */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-10 border border-green-100 text-center">
            <div className="inline-flex items-center gap-2 bg-white text-primary text-sm font-medium px-4 py-1.5 rounded-full mb-6 shadow-sm">
              Em breve
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-4">
              Próxima funcionalidade: Conciliação automática
            </h2>
            <p className="text-gray-600 text-lg">
              Em breve você poderá conectar sua conta e conciliar de forma automática.
            </p>
          </div>
        </div>
      </section>

      {/* Formulário de sugestões */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-xl mx-auto px-6">
          <h2 className="text-3xl font-semibold text-center text-gray-900 mb-2">
            Que recurso você gostaria de ver no Confia Financeiro?
          </h2>
          <p className="text-center text-gray-500 mb-10">Sua sugestão ajuda a evoluir o sistema.</p>

          {submitted ? (
            <div className="bg-white rounded-2xl p-8 border border-green-200 text-center">
              <CheckCircle className="text-primary mx-auto mb-3" size={40} />
              <p className="text-lg font-medium text-gray-900">Sugestão enviada!</p>
              <p className="text-gray-500 mt-1">Obrigado pelo feedback.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Qual recurso você sente falta?</label>
                <input
                  type="text"
                  required
                  value={form.feature}
                  onChange={(e) => setForm({ ...form, feature: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Como isso ajudaria no seu dia a dia? (opcional)</label>
                <textarea
                  rows={3}
                  value={form.help}
                  onChange={(e) => setForm({ ...form, help: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 rounded-xl transition-colors"
              >
                Enviar sugestão
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/icon.jpg" alt="Confia Financeiro" className="w-8 h-8 rounded-full" />
            <span className="font-medium text-gray-900">Confia Financeiro</span>
          </div>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary"
          >
            <Instagram size={18} /> Instagram
          </a>
        </div>
      </footer>
    </div>
  );
}
