import React, { useState, useEffect } from 'react';
import { useGlobal } from '../context/GlobalState';
import { Card, Button, StatusBadge, Input, Modal } from '../components/UIComponents';
import { Plus, Shield, ArrowRight, ArrowLeft, Leaf, UserCheck, Trees } from 'lucide-react';
import { Deal } from '../types';
import { useSearchParams } from 'react-router-dom';

interface DealCardProps {
  deal: Deal;
  isIncoming: boolean;
  onRelease: (id: string) => Promise<void>;
  onAccept: (id: string) => Promise<void>;
}

const DealCard: React.FC<DealCardProps> = ({ deal, isIncoming, onRelease, onAccept }) => (
  <Card className="p-4 transition-all hover:shadow-lg border-l-4 border-l-brand-600 mb-4 rounded-xl border-brand-50">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                  <h3 className="text-base font-bold text-brand-900 dark:text-white">{deal.title}</h3>
                  <StatusBadge status={deal.status} />
              </div>
              <p className="text-xs font-medium text-brand-600 dark:text-brand-400 mb-3">{deal.description}</p>
              <div className="p-3 bg-brand-50 dark:bg-brand-800 rounded-xl border border-brand-100 dark:border-brand-700 mb-3">
                  <p className="text-[8px] font-black text-brand-400 uppercase mb-1 tracking-widest">Task</p>
                  <p className="text-[11px] font-bold text-brand-800 dark:text-brand-100">{deal.task}</p>
              </div>
              <div className="flex items-center gap-3 text-[9px] font-black text-brand-400 uppercase tracking-wider">
                  <span className="bg-brand-100 dark:bg-brand-800 px-1.5 py-0.5 rounded">ID: {deal.id.slice(0, 6).toUpperCase()}</span>
                  <span className="flex items-center gap-1">
                      {isIncoming ? <ArrowLeft size={10} className="text-emerald-500"/> : <ArrowRight size={10} className="text-brand-600"/>}
                      {isIncoming ? deal.creatorName : (deal.counterpartyName || 'Partner')}
                  </span>
              </div>
          </div>

          <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-4 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-brand-100 dark:border-brand-800 md:pl-6">
              <div className="text-left md:text-right">
                  <p className="text-[8px] font-black text-brand-400 uppercase tracking-widest">Value</p>
                  <p className="text-xl font-black text-brand-900 dark:text-white">${deal.amount.toLocaleString()}</p>
              </div>
              <div className="flex flex-col gap-2 min-w-[120px]">
                  {!isIncoming && deal.status === 'active' && <Button size="sm" onClick={() => onRelease(deal.id)} className="w-full bg-brand-700 rounded-lg py-2">Release</Button>}
                  {isIncoming && deal.status === 'pending_acceptance' && <Button size="sm" onClick={() => onAccept(deal.id)} className="w-full bg-emerald-600 rounded-lg py-2">Accept</Button>}
                  {deal.status === 'active' && <Button size="sm" variant="ghost" className="text-red-500 text-[10px] py-1">Dispute</Button>}
              </div>
          </div>
      </div>
  </Card>
);

export const Broker = () => {
  const { deals, user, releaseDeal, createDeal, acceptDeal } = useGlobal();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', counterpartyEmail: '', amount: '', description: '', task: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (searchParams.get('create') === 'true') {
        setIsModalOpen(true);
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('create');
        setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const amount = parseFloat(formData.amount);
    if (!amount) return;
    const success = await createDeal({
        title: formData.title, counterpartyEmail: formData.counterpartyEmail,
        amount: amount, description: formData.description, task: formData.task
    });
    if (success) {
        setIsModalOpen(false);
        setFormData({ title: '', counterpartyEmail: '', amount: '', description: '', task: '' });
    } else {
        setError('Verification failed.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
                <h1 className="text-xl font-black text-brand-900 dark:text-white tracking-tight">Escrow</h1>
                <p className="text-xs text-brand-600 dark:text-brand-400 font-bold uppercase tracking-wide">Secure P2P Commerce</p>
            </div>
            <Button size="sm" onClick={() => setIsModalOpen(true)} className="rounded-lg bg-brand-700 px-6">
                <Plus className="w-3.5 h-3.5 mr-1" /> New Deal
            </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-5 bg-brand-800 text-white border-none rounded-2xl shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <p className="text-[8px] font-black text-brand-200 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Shield size={10} /> Locked Capital</p>
                    <p className="text-2xl font-black">${user?.escrowBalance.toLocaleString()}</p>
                </div>
            </Card>
            <Card className="p-5 rounded-2xl border-brand-100 shadow-sm">
                <p className="text-[8px] font-black text-brand-400 uppercase tracking-widest mb-1">Attention Required</p>
                <p className="text-2xl font-black text-brand-900 dark:text-white">
                    {deals.filter(d => d.status === 'pending_acceptance' || (d.creatorId === user?.id && d.status === 'active')).length}
                </p>
            </Card>
            <Card className="p-5 rounded-2xl border-brand-100 shadow-sm">
                <p className="text-[8px] font-black text-brand-400 uppercase tracking-widest mb-1">Success History</p>
                <p className="text-2xl font-black text-brand-900 dark:text-white">
                    {deals.filter(d => d.status === 'completed').length}
                </p>
            </Card>
        </div>

        <div className="space-y-6">
            {deals.filter(d => d.counterpartyId === user?.id).length > 0 && (
                <div>
                    <h2 className="text-sm font-black text-brand-900 dark:text-white mb-3 uppercase tracking-widest flex items-center gap-1.5">
                        <ArrowLeft size={14} className="text-emerald-500" /> Incoming
                    </h2>
                    {deals.filter(d => d.counterpartyId === user?.id).map(deal => <DealCard key={deal.id} deal={deal} isIncoming={true} onRelease={releaseDeal} onAccept={acceptDeal} />)}
                </div>
            )}
            <div>
                <h2 className="text-sm font-black text-brand-900 dark:text-white mb-3 uppercase tracking-widest flex items-center gap-1.5">
                    <ArrowRight size={14} className="text-brand-600" /> Outgoing
                </h2>
                {deals.filter(d => d.creatorId === user?.id).length > 0 ? (
                    deals.filter(d => d.creatorId === user?.id).map(deal => <DealCard key={deal.id} deal={deal} isIncoming={false} onRelease={releaseDeal} onAccept={acceptDeal} />)
                ) : (
                    <div className="text-center py-10 bg-brand-50/50 dark:bg-brand-900/10 rounded-2xl border-2 border-dashed border-brand-100 dark:border-brand-800">
                        <p className="text-[10px] font-black text-brand-400 uppercase">Empty Vault</p>
                    </div>
                )}
            </div>
        </div>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Escrow">
            <form onSubmit={handleCreateDeal} className="space-y-4">
                <Input label="Title" placeholder="Service or Item" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                <Input label="Partner Email" type="email" placeholder="partner@domain.com" value={formData.counterpartyEmail} onChange={e => setFormData({...formData, counterpartyEmail: e.target.value})} required />
                <Input label="Amount ($)" type="number" placeholder="0.00" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required />
                <div>
                    <label className="block text-[10px] font-black text-brand-400 uppercase tracking-widest mb-1.5">Tasks</label>
                    <textarea className="w-full bg-brand-50 dark:bg-brand-800 border border-brand-100 dark:border-brand-700 rounded-lg py-2 px-3 text-xs font-bold focus:ring-1 focus:ring-brand-500" rows={2} placeholder="Deliverables..." value={formData.task} onChange={e => setFormData({...formData, task: e.target.value})} />
                </div>
                {error && <p className="text-red-500 text-[10px] font-bold bg-red-50 p-2 rounded-lg">{error}</p>}
                <div className="flex justify-end pt-2 gap-2">
                    <Button type="submit" size="sm" className="rounded-lg px-6 bg-brand-700 font-bold">Launch Deal</Button>
                </div>
            </form>
        </Modal>
    </div>
  );
};