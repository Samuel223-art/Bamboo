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
  <div className="flex items-center justify-between p-3 bg-brand-50 dark:bg-brand-800/50 rounded-xl border border-brand-100 dark:border-brand-700">
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-full bg-white dark:bg-brand-700 flex items-center justify-center text-xs font-bold shadow-sm">
        {pair.split('/')[0]}
      </div>
      <span className="font-bold text-sm text-brand-900 dark:text-brand-50">{pair}</span>
    </div>
    <div className="text-right">
      <p className="font-semibold text-sm">{rate}</p>
      <p className={`text-xs font-bold ${change >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
        {change > 0 ? '+' : ''}{change}%
      </p>
    </div>
  </div>
);

const ActivityBar: React.FC<{ height: string; day: string; active?: boolean; income: number; expense: number }> = ({ height, day, active, income, expense }) => (
  <div className="flex flex-col items-center gap-2 flex-1 group relative">
    <div className="absolute bottom-full mb-2 hidden group-hover:block bg-brand-900 text-white text-[10px] rounded p-2 z-10 whitespace-nowrap shadow-xl">
        <div className="text-brand-300">Income: +${income.toLocaleString()}</div>
        <div className="text-red-300">Spent: -${expense.toLocaleString()}</div>
    </div>
    <div className="w-full bg-brand-50 dark:bg-brand-800/30 rounded-t-xl h-32 relative overflow-hidden cursor-pointer">
      <div 
        className={`absolute bottom-0 left-0 right-0 transition-all duration-700 ${active ? 'bg-gradient-to-t from-brand-700 to-brand-500' : 'bg-brand-200 dark:bg-brand-900/40 group-hover:bg-brand-300'}`}
        style={{ height }}
      ></div>
    </div>
    <span className={`text-[10px] font-bold uppercase tracking-wider ${active ? 'text-brand-700' : 'text-brand-300'}`}>{day}</span>
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
    alert('Account number copied!');
  };
  
  const handleQuickSend = () => {
    if(!quickRecipient) return;
    navigate(`/send?to=${encodeURIComponent(quickRecipient)}&amount=${quickAmount}`);
  };

  const maxActivity = Math.max(...activityData.map(d => d.income + d.expense), 100);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-900 dark:text-white tracking-tight">Overview</h1>
          <p className="text-brand-600 dark:text-brand-400 font-medium">Welcome back, {user.name.split(' ')[0]}</p>
        </div>
        <div className="flex gap-3 items-center">
          <Link to="/send">
            <Button className="rounded-xl px-6 bg-brand-700 hover:bg-brand-800 shadow-xl shadow-brand-900/10">
              <Plus className="w-4 h-4 mr-2" /> Send Money
            </Button>
          </Link>
          <Link to="/wallet">
            <Button variant="outline" className="rounded-xl px-6 bg-white dark:bg-brand-900 border-brand-200">
               <ArrowDownLeft className="w-4 h-4 mr-2" /> Top Up
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-br from-brand-800 via-brand-700 to-brand-900 rounded-3xl p-6 md:p-10 text-white shadow-2xl shadow-brand-900/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Trees size={300} />
          </div>
          <div className="relative z-10 flex flex-col h-full justify-between min-h-[220px]">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <p className="text-brand-200 font-bold uppercase text-xs tracking-widest">Total Balance</p>
                <span className="bg-emerald-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold text-emerald-400 border border-emerald-400/20">+4.2% This Month</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-8 transition-all duration-500">
                ${user.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10 hover:bg-white/10 transition-all cursor-pointer group" onClick={copyToClipboard}>
                <p className="text-[10px] font-bold uppercase text-brand-300 mb-2">Account Number</p>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xl tracking-widest opacity-90">{user.accountNumber}</span>
                  <Copy size={16} className="text-brand-400 group-hover:text-white" />
                </div>
              </div>
              
              <div className="flex gap-3">
                 <div className="flex-1 bg-brand-950/30 backdrop-blur-md rounded-2xl p-4 border border-white/5">
                    <p className="text-[10px] font-bold uppercase text-brand-400 mb-1 text-center">Escrow</p>
                    <p className="font-bold text-xl text-center">${user.escrowBalance.toLocaleString()}</p>
                 </div>
                 <div className="flex-1 bg-emerald-500/10 backdrop-blur-md rounded-2xl p-4 border border-emerald-400/10">
                    <p className="text-[10px] font-bold uppercase text-emerald-400 mb-1 text-center">Active Deals</p>
                    <p className="font-bold text-xl text-emerald-100 text-center">
                        {deals.filter(d => (d.creatorId === user.id || d.counterpartyId === user.id) && d.status === 'active').length}
                    </p>
                 </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
           <Card className="p-6 border-brand-100 rounded-3xl shadow-lg">
              <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-brand-900 dark:text-white text-lg">Quick Send</h3>
                  <Link to="/send" className="text-xs font-bold text-brand-600 hover:text-brand-700">Full Form</Link>
              </div>
              <div className="flex gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                  <button onClick={() => navigate('/send')} className="flex flex-col items-center min-w-[60px] gap-2 group">
                     <div className="w-14 h-14 rounded-full bg-brand-50 dark:bg-brand-800 flex items-center justify-center border-2 border-dashed border-brand-200 dark:border-brand-700 text-brand-400 group-hover:border-brand-500 group-hover:text-brand-600 transition-all">
                         <Plus size={20} />
                     </div>
                     <span className="text-[10px] text-brand-600 font-bold uppercase">Add</span>
                  </button>
                  {recentRecipients.map((contact, i) => (
                      <button key={i} onClick={() => setQuickRecipient(contact.email)} className={`flex flex-col items-center min-w-[60px] gap-2 group transition-all ${quickRecipient === contact.email ? 'scale-110' : 'opacity-70'}`}>
                         <div className={`relative p-1 rounded-full ${quickRecipient === contact.email ? 'bg-brand-600' : 'bg-transparent'}`}>
                             <img src={contact.avatar} className="w-12 h-12 rounded-full border-2 border-white dark:border-brand-900 shadow-md" alt={contact.name} />
                         </div>
                         <span className={`text-[10px] truncate w-full text-center font-bold ${quickRecipient === contact.email ? 'text-brand-700' : 'text-brand-500'}`}>
                             {contact.name.split(' ')[0]}
                         </span>
                      </button>
                  ))}
              </div>
              <div className="space-y-4">
                  <Input placeholder="Recipient Email" value={quickRecipient} onChange={e => setQuickRecipient(e.target.value)} className="rounded-xl border-brand-100" />
                  <div className="relative">
                      <span className="absolute left-4 top-3 text-brand-400 font-bold text-sm">$</span>
                      <input type="number" placeholder="0.00" className="w-full bg-brand-50 dark:bg-brand-800 border border-brand-100 dark:border-brand-700 rounded-xl py-3 pl-8 pr-4 font-bold focus:ring-2 focus:ring-brand-500" value={quickAmount} onChange={e => setQuickAmount(e.target.value)} />
                  </div>
                  <Button className="w-full rounded-xl py-4 bg-brand-700 font-bold shadow-brand-900/20" onClick={handleQuickSend}>Send Now</Button>
              </div>
           </Card>

          <Card className="p-6 border-brand-100 rounded-3xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-brand-900 dark:text-white flex items-center gap-2">
                <TrendingUp size={18} className="text-emerald-500" /> Market Rates
              </h3>
            </div>
            <div className="space-y-3">
              <MarketRate pair="USD/EUR" rate="0.9432" change={0.12} />
              <MarketRate pair="BTC/USD" rate="34,250" change={1.2} />
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-8 border-brand-100 rounded-3xl shadow-lg">
          <div className="flex items-center justify-between mb-8">
             <div>
               <h3 className="text-xl font-bold text-brand-900 dark:text-white">Activity</h3>
               <p className="text-xs font-medium text-brand-400">7-Day Spending Habit</p>
             </div>
          </div>
          <div className="flex items-end justify-between gap-4 h-48 px-2">
             {activityData.length > 0 ? (
                 activityData.map((data, i) => (
                     <ActivityBar key={i} day={data.day} income={data.income} expense={data.expense} height={`${Math.max(((data.income + data.expense) / maxActivity) * 100, 5)}%`} active={data.date === new Date().toISOString().split('T')[0]} />
                 ))
             ) : (
                 <div className="w-full h-full flex flex-col items-center justify-center text-brand-300">
                     <Leaf size={32} className="mb-2 opacity-20" />
                     <p className="text-xs font-bold uppercase">No Transactions Yet</p>
                 </div>
             )}
          </div>
        </Card>

        <Card className="lg:col-span-2 p-8 border-brand-100 rounded-3xl shadow-lg">
             <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-brand-900 dark:text-white">Recent Transactions</h3>
                <Link to="/transactions" className="text-sm font-bold text-brand-600 hover:underline">View All</Link>
             </div>
             <div className="space-y-1">
                {user.id && <p className="text-center py-10 text-brand-300 font-medium italic">Your latest transactions will appear here.</p>}
             </div>
        </Card>
      </div>
    </div>
  );
};