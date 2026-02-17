import React, { useState } from 'react';
import { useGlobal } from '../context/GlobalState';
import { Card, Button, IconBox, TransactionRow, Select, Input } from '../components/UIComponents';
import { 
  Trees, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Leaf,
  TrendingUp,
  CreditCard,
  Copy,
  Plus
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const MarketRate: React.FC<{ pair: string; rate: string; change: number }> = ({ pair, rate, change }) => (
  <div className="flex items-center justify-between p-2.5 bg-brand-50 dark:bg-brand-800/50 rounded-xl border border-brand-100 dark:border-brand-700">
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-full bg-white dark:bg-brand-700 flex items-center justify-center text-[10px] font-black shadow-sm">
        {pair.split('/')[0]}
      </div>
      <span className="font-bold text-xs text-brand-900 dark:text-brand-50">{pair}</span>
    </div>
    <div className="text-right">
      <p className="font-bold text-xs">{rate}</p>
      <p className={`text-[10px] font-black ${change >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
        {change > 0 ? '+' : ''}{change}%
      </p>
    </div>
  </div>
);

const ActivityBar: React.FC<{ height: string; day: string; active?: boolean; income: number; expense: number }> = ({ height, day, active, income, expense }) => (
  <div className="flex flex-col items-center gap-1 flex-1 group relative">
    <div className="absolute bottom-full mb-1 hidden group-hover:block bg-brand-900 text-white text-[8px] rounded p-1.5 z-10 whitespace-nowrap shadow-xl">
        <div className="text-brand-300">Ingreso: +${income.toLocaleString()}</div>
        <div className="text-red-300">Gasto: -${expense.toLocaleString()}</div>
    </div>
    <div className="w-full bg-brand-50 dark:bg-brand-800/30 rounded-t-lg h-24 relative overflow-hidden cursor-pointer">
      <div 
        className={`absolute bottom-0 left-0 right-0 transition-all duration-700 ${active ? 'bg-gradient-to-t from-brand-700 to-brand-500' : 'bg-brand-200 dark:bg-brand-900/40 group-hover:bg-brand-300'}`}
        style={{ height }}
      ></div>
    </div>
    <span className={`text-[8px] font-black uppercase tracking-wider ${active ? 'text-brand-700' : 'text-brand-300'}`}>{day}</span>
  </div>
);

export const Dashboard = () => {
  const { user, deals, activityData, recentRecipients } = useGlobal();
  const navigate = useNavigate();
  const [quickRecipient, setQuickRecipient] = useState('');
  const [quickAmount, setQuickAmount] = useState('');

  if (!user) return null;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(user.accountNumber);
    alert('¡Número de cuenta copiado!');
  };
  
  const handleQuickSend = () => {
    if(!quickRecipient) return;
    navigate(`/send?to=${encodeURIComponent(quickRecipient)}&amount=${quickAmount}`);
  };

  const maxActivity = Math.max(...activityData.map(d => d.income + d.expense), 100);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-brand-900 dark:text-white tracking-tight">Resumen</h1>
          <p className="text-xs text-brand-600 dark:text-brand-400 font-bold uppercase tracking-wide">Hola, {user.name.split(' ')[0]}</p>
        </div>
        <div className="flex gap-2 items-center">
          <Link to="/send">
            <Button size="sm" className="rounded-lg bg-brand-700 shadow-md">
              <Plus className="w-3.5 h-3.5 mr-1" /> Enviar
            </Button>
          </Link>
          <Link to="/wallet">
            <Button size="sm" variant="outline" className="rounded-lg bg-white dark:bg-brand-900">
               Recargar
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-gradient-to-br from-brand-800 via-brand-700 to-brand-900 rounded-2xl p-5 md:p-8 text-white shadow-xl shadow-brand-900/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Trees size={200} />
          </div>
          <div className="relative z-10 flex flex-col h-full justify-between min-h-[160px]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-brand-200 font-black uppercase text-[8px] tracking-[0.2em]">Balance Total</p>
                <span className="bg-emerald-500/20 px-1.5 py-0.5 rounded-full text-[8px] font-black text-emerald-400 border border-emerald-400/20">CRECIENDO</span>
              </div>
              <h2 className="text-4xl font-black tracking-tighter mb-4">
                ${user.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white/5 backdrop-blur-md rounded-xl p-3 border border-white/10 hover:bg-white/10 transition-all cursor-pointer group" onClick={copyToClipboard}>
                <p className="text-[8px] font-black uppercase text-brand-300 mb-1 tracking-wider">No. de Cuenta</p>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-base tracking-widest opacity-90">{user.accountNumber}</span>
                  <Copy size={14} className="text-brand-400 group-hover:text-white" />
                </div>
              </div>
              
              <div className="flex gap-2">
                 <div className="flex-1 bg-brand-950/20 backdrop-blur-md rounded-xl p-3 border border-white/5">
                    <p className="text-[8px] font-black uppercase text-brand-400 mb-0.5 text-center">Escrow</p>
                    <p className="font-bold text-base text-center">${user.escrowBalance.toLocaleString()}</p>
                 </div>
                 <div className="flex-1 bg-emerald-500/10 backdrop-blur-md rounded-xl p-3 border border-emerald-400/10">
                    <p className="text-[8px] font-black uppercase text-emerald-400 mb-0.5 text-center">Tratos</p>
                    <p className="font-bold text-base text-emerald-100 text-center">
                        {deals.filter(d => (d.creatorId === user.id || d.counterpartyId === user.id) && d.status === 'active').length}
                    </p>
                 </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
           <Card className="p-4 border-brand-100 rounded-2xl shadow-md">
              <div className="flex items-center justify-between mb-4">
                  <h3 className="font-black text-brand-900 dark:text-white text-sm uppercase tracking-wider">Envío Rápido</h3>
              </div>
              <div className="flex gap-3 mb-4 overflow-x-auto pb-1 scrollbar-hide">
                  <button onClick={() => navigate('/send')} className="flex flex-col items-center min-w-[50px] gap-1 group">
                     <div className="w-10 h-10 rounded-full bg-brand-50 dark:bg-brand-800 flex items-center justify-center border-2 border-dashed border-brand-200 dark:border-brand-700 text-brand-400 group-hover:border-brand-500 group-hover:text-brand-600 transition-all">
                         <Plus size={16} />
                     </div>
                     <span className="text-[8px] text-brand-600 font-black uppercase">Añadir</span>
                  </button>
                  {recentRecipients.map((contact, i) => (
                      <button key={i} onClick={() => setQuickRecipient(contact.email)} className={`flex flex-col items-center min-w-[50px] gap-1 group transition-all ${quickRecipient === contact.email ? 'scale-105' : 'opacity-60'}`}>
                         <div className={`relative p-0.5 rounded-full ${quickRecipient === contact.email ? 'bg-brand-600' : 'bg-transparent'}`}>
                             <img src={contact.avatar} className="w-9 h-9 rounded-full border border-white dark:border-brand-900" alt={contact.name} />
                         </div>
                         <span className={`text-[8px] truncate w-full text-center font-black uppercase ${quickRecipient === contact.email ? 'text-brand-700' : 'text-brand-500'}`}>
                             {contact.name.split(' ')[0]}
                         </span>
                      </button>
                  ))}
              </div>
              <div className="space-y-2.5">
                  <Input placeholder="Email o Cuenta" value={quickRecipient} onChange={e => setQuickRecipient(e.target.value)} className="rounded-lg border-brand-100" />
                  <div className="relative">
                      <span className="absolute left-3 top-2.5 text-brand-400 font-black text-xs">$</span>
                      <input type="number" placeholder="0.00" className="w-full bg-brand-50 dark:bg-brand-800 border border-brand-100 dark:border-brand-700 rounded-lg py-2 pl-6 pr-3 text-xs font-bold focus:ring-2 focus:ring-brand-500" value={quickAmount} onChange={e => setQuickAmount(e.target.value)} />
                  </div>
                  <Button size="sm" className="w-full rounded-lg py-2.5 bg-brand-700 font-bold" onClick={handleQuickSend}>Enviar Fondos</Button>
              </div>
           </Card>

          <Card className="p-4 border-brand-100 rounded-2xl">
            <h3 className="font-black text-brand-900 dark:text-white text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
              <TrendingUp size={14} className="text-emerald-500" /> Mercado
            </h3>
            <div className="space-y-2">
              <MarketRate pair="USD/EUR" rate="0.9432" change={0.12} />
              <MarketRate pair="BTC/USD" rate="34,250" change={1.2} />
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-5 border-brand-100 rounded-2xl shadow-md">
          <div className="flex items-center justify-between mb-6">
             <div>
               <h3 className="text-sm font-black text-brand-900 dark:text-white uppercase tracking-widest">Actividad</h3>
               <p className="text-[9px] font-bold text-brand-400 uppercase tracking-wide">Últimos 7 Días</p>
             </div>
          </div>
          <div className="flex items-end justify-between gap-2.5 h-32 px-1">
             {activityData.length > 0 ? (
                 activityData.map((data, i) => (
                     <ActivityBar key={i} day={data.day} income={data.income} expense={data.expense} height={`${Math.max(((data.income + data.expense) / maxActivity) * 100, 5)}%`} active={data.date === new Date().toISOString().split('T')[0]} />
                 ))
             ) : (
                 <div className="w-full h-full flex flex-col items-center justify-center text-brand-300">
                     <Leaf size={24} className="mb-1 opacity-20" />
                     <p className="text-[8px] font-black uppercase">Temporada Seca</p>
                 </div>
             )}
          </div>
        </Card>

        <Card className="lg:col-span-2 p-5 border-brand-100 rounded-2xl shadow-md">
             <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black text-brand-900 dark:text-white uppercase tracking-widest">Transacciones</h3>
                <Link to="/transactions" className="text-[10px] font-black text-brand-600 hover:underline uppercase">Historial</Link>
             </div>
             <div className="space-y-1">
                {user.id && <p className="text-center py-6 text-brand-300 text-[10px] font-bold uppercase italic tracking-widest">Esperando transacciones...</p>}
             </div>
        </Card>
      </div>
    </div>
  );
};
