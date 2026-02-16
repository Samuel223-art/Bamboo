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
  <Card className="p-6 transition-all hover:shadow-xl border-l-8 border-l-brand-600 mb-6 rounded-2xl border-brand-50">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-brand-900 dark:text-white">{deal.title}</h3>
                  <StatusBadge status={deal.status} />
                  {isIncoming && <span className="text-[10px] font-bold bg-brand-100 text-brand-800 px-3 py-1 rounded-full uppercase tracking-wider">Incoming Deal</span>}
              </div>
              <p className="text-sm font-medium text-brand-600 dark:text-brand-400 mb-4">{deal.description}</p>
              <div className="p-4 bg-brand-50 dark:bg-brand-800 rounded-2xl border border-brand-100 dark:border-brand-700 mb-4">
                  <p className="text-[10px] font-black text-brand-400 uppercase mb-2 tracking-widest">Requirements to release</p>
                  <p className="text-sm font-bold text-brand-800 dark:text-brand-100">{deal.task}</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold text-brand-400">
                  <span className="font-mono bg-brand-100 dark:bg-brand-800 px-2 py-1 rounded">#{deal.id.slice(0, 10).toUpperCase()}</span>
                  <span className="flex items-center gap-1">
                      {isIncoming ? <ArrowLeft size={14} className="text-emerald-500"/> : <ArrowRight size={14} className="text-brand-600"/>}
                      {isIncoming ? `From: ${deal.creatorName}` : `To: ${deal.counterpartyName || deal.counterpartyEmail}`}
                  </span>
              </div>
          </div>

          <div className="flex items-center gap-10 border-t md:border-t-0 md:border-l border-brand-100 dark:border-brand-800 pt-6 md:pt-0 md:pl-10">
              <div className="text-center md:text-left">
                  <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-1">Total Value</p>
                  <p className="text-3xl font-black text-brand-900 dark:text-white">${deal.amount.toLocaleString()}</p>
              </div>
          </div>

          <div className="flex flex-col gap-3 min-w-[160px]">
              {!isIncoming && deal.status === 'active' && <Button size="sm" onClick={() => onRelease(deal.id)} className="w-full bg-brand-700 hover:bg-brand-800 rounded-xl py-3 font-bold">Release Funds</Button>}
              {!isIncoming && deal.status === 'pending_acceptance' && <Button size="sm" variant="outline" disabled className="w-full opacity-60 rounded-xl">Pending Acceptance</Button>}
              {isIncoming && deal.status === 'pending_acceptance' && <Button size="sm" onClick={() => onAccept(deal.id)} className="w-full bg-emerald-600 hover:bg-emerald-700 rounded-xl py-3 font-bold">Accept Deal</Button>}
              {isIncoming && deal.status === 'active' && <Button size="sm" variant="outline" disabled className="w-full border-brand-200 text-brand-700 bg-brand-50 rounded-xl font-bold">In Progress</Button>}
              {deal.status === 'active' && <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-50 w-full font-bold">Open Dispute</Button>}
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
        // Clear param so it doesn't pop up again if they navigate back/refresh
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
    if (!formData.task || formData.task.trim() === '') {
        setError("Requirements are required.");
        return;
    }
    const success = await createDeal({
        title: formData.title, counterpartyEmail: formData.counterpartyEmail,
        amount: amount, description: formData.description, task: formData.task
    });
    if (success) {
        setIsModalOpen(false);
        setFormData({ title: '', counterpartyEmail: '', amount: '', description: '', task: '' });
    } else {
        setError('Verification failed. Check balance or counterparty email.');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-black text-brand-900 dark:text-white tracking-tight">Escrow Service</h1>
                <p className="text-brand-600 dark:text-brand-400 font-medium">Securely hold funds until tasks are completed</p>
            </div>
            <Button onClick={() => setIsModalOpen(true)} className="rounded-xl px-8 bg-brand-700 shadow-xl shadow-brand-900/10">
                <Plus className="w-4 h-4 mr-2" /> Create Deal
            </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 bg-brand-800 text-white border-none relative overflow-hidden rounded-3xl shadow-xl">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-white/20 p-2 rounded-lg"><Trees size={20} /></div>
                        <h3 className="font-bold text-brand-100 uppercase tracking-widest text-xs">Locked Funds</h3>
                    </div>
                    <p className="text-4xl font-black">${user?.escrowBalance.toLocaleString()}</p>
                    <p className="text-xs font-bold text-brand-300 mt-4 flex items-center gap-2"><Shield size={14} /> Backed by Bamboo Guarantee</p>
                </div>
                <div className="absolute -right-8 -bottom-8 text-white/5 pointer-events-none rotate-12"><Shield size={200} /></div>
            </Card>
            <Card className="p-8 rounded-3xl border-brand-100 shadow-lg">
                <h3 className="text-brand-400 text-xs font-black uppercase tracking-widest mb-2">Needs Attention</h3>
                <p className="text-4xl font-black text-brand-900 dark:text-white">
                    {deals.filter(d => d.status === 'pending_acceptance' || (d.creatorId === user?.id && d.status === 'active')).length}
                </p>
                <p className="text-xs font-bold text-emerald-600 mt-4">Deals waiting for action</p>
            </Card>
            <Card className="p-8 rounded-3xl border-brand-100 shadow-lg">
                <h3 className="text-brand-400 text-xs font-black uppercase tracking-widest mb-2">Completed Deals</h3>
                <p className="text-4xl font-black text-brand-900 dark:text-white">
                    {deals.filter(d => d.status === 'completed').length}
                </p>
                <p className="text-xs font-bold text-brand-500 mt-4">Successful transactions</p>
            </Card>
        </div>

        <div className="space-y-10">
            {deals.filter(d => d.counterpartyId === user?.id).length > 0 && (
                <div>
                    <h2 className="text-xl font-black text-brand-900 dark:text-white mb-6 flex items-center gap-2">
                        <ArrowLeft className="text-emerald-500" /> Incoming Proposals
                    </h2>
                    {deals.filter(d => d.counterpartyId === user?.id).map(deal => <DealCard key={deal.id} deal={deal} isIncoming={true} onRelease={releaseDeal} onAccept={acceptDeal} />)}
                </div>
            )}
            <div>
                <h2 className="text-xl font-black text-brand-900 dark:text-white mb-6 flex items-center gap-2">
                    <ArrowRight className="text-brand-600" /> Sent Proposals
                </h2>
                {deals.filter(d => d.creatorId === user?.id).length > 0 ? (
                    deals.filter(d => d.creatorId === user?.id).map(deal => <DealCard key={deal.id} deal={deal} isIncoming={false} onRelease={releaseDeal} onAccept={acceptDeal} />)
                ) : (
                    <div className="text-center py-16 bg-brand-50/50 dark:bg-brand-900/20 rounded-3xl border-4 border-dashed border-brand-100 dark:border-brand-800">
                        <Leaf className="w-12 h-12 text-brand-200 mx-auto mb-4" />
                        <p className="font-bold text-brand-600">No escrow deals yet. Create one to securely transact with partners.</p>
                        <Button variant="ghost" className="mt-4 text-brand-700 font-bold" onClick={() => setIsModalOpen(true)}>Create First Deal</Button>
                    </div>
                )}
            </div>
        </div>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Escrow Deal">
            <form onSubmit={handleCreateDeal} className="space-y-5">
                <div className="bg-brand-50 dark:bg-brand-900/30 p-5 rounded-2xl flex gap-4 text-sm text-brand-800 dark:text-brand-200 border border-brand-100 dark:border-brand-700">
                    <Shield className="shrink-0 text-brand-600" size={24} />
                    <p className="font-medium">Funds will be held in our secure vault. The partner must accept the deal before it becomes active.</p>
                </div>
                <Input label="Deal Title" placeholder="e.g. Website Development" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                <Input label="Recipient Email" type="email" placeholder="partner@example.com" value={formData.counterpartyEmail} onChange={e => setFormData({...formData, counterpartyEmail: e.target.value})} required icon={<UserCheck size={18} />} />
                <Input label="Deal Amount ($)" type="number" placeholder="0.00" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required />
                <div>
                    <label className="block text-xs font-black text-brand-400 uppercase tracking-widest mb-2">Requirements / Tasks</label>
                    <textarea className="w-full bg-brand-50 dark:bg-brand-800 border border-brand-100 dark:border-brand-700 rounded-2xl py-3 px-4 text-brand-900 dark:text-white font-bold focus:ring-2 focus:ring-brand-500" rows={3} placeholder="What must be done for the funds to be released?" value={formData.task} onChange={e => setFormData({...formData, task: e.target.value})} />
                </div>
                <div className="flex justify-between items-center text-xs font-bold py-3 bg-brand-50 dark:bg-brand-800 px-4 rounded-xl">
                    <span className="text-brand-500">Service Fee (5%)</span>
                    <span className="text-brand-900 dark:text-white">${(parseFloat(formData.amount || '0') * 0.05).toFixed(2)}</span>
                </div>
                {error && <p className="text-red-500 text-sm font-bold bg-red-50 p-3 rounded-xl">{error}</p>}
                <div className="flex justify-end pt-4 gap-3">
                    <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="font-bold">Cancel</Button>
                    <Button type="submit" className="rounded-xl px-8 bg-brand-700 font-bold">Create Deal</Button>
                </div>
            </form>
        </Modal>
    </div>
  );
};