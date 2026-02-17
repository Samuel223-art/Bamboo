import React, { useState, useEffect } from 'react';
import { useGlobal } from '../context/GlobalState';
import { Button, Input, Card, Modal } from '../components/UIComponents';
import { 
    ArrowRight, 
    Search, 
    User as UserIcon, 
    CheckCircle2, 
    ArrowLeft, 
    Clock, 
    CreditCard,
    DollarSign,
    ShieldCheck,
    Key
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const SendMoney = () => {
  const { user, sendMoney, searchUser, recentRecipients } = useGlobal();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [recipient, setRecipient] = useState('');
  const [selectedContact, setSelectedContact] = useState<{name: string, email: string, avatarUrl: string} | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // PIN State
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');

  if (!user) return null;

  useEffect(() => {
    const toParam = searchParams.get('to');
    const amountParam = searchParams.get('amount');

    if (toParam) {
        setRecipient(toParam);
        verifyAndProgress(toParam, amountParam);
    }
  }, [searchParams]);

  const verifyAndProgress = async (id: string, amt?: string | null) => {
    setIsLoading(true);
    setError('');
    try {
        const found = await searchUser(id);
        if (found) {
            setSelectedContact(found);
            setRecipient(found.email);
            if (amt) setAmount(amt);
            setStep(2);
        } else {
            setError('Recipient not found. Check the email or account number.');
        }
    } catch (e) {
        setError('Error searching for recipient.');
    } finally {
        setIsLoading(false);
    }
  };

  const handleSelectContact = (contact: any) => {
      setSelectedContact({
          name: contact.name,
          email: contact.email,
          avatarUrl: contact.avatar
      });
      setRecipient(contact.email);
      setStep(2);
      setError('');
  };

  const handleVerifyRecipient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (recipient.length < 3) {
      setError('Please enter a valid email or account number');
      return;
    }
    await verifyAndProgress(recipient);
  };

  const handleAmountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!val || val <= 0) {
        setError('Please enter a valid amount');
        return;
    }
    if (val > user.balance) {
        setError('Insufficient balance');
        return;
    }
    setError('');
    setStep(3); // Go to Review
  };

  const initiateTransfer = () => {
      if (!user.transactionPin) {
          setError("Please set a Transaction PIN in Settings before sending money.");
          return;
      }
      setShowPinModal(true);
      setError('');
  };

  const handleFinalTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
        const val = parseFloat(amount);
        const success = await sendMoney(val, recipient, note || 'Transfer', pin);
        
        if (success) {
            setShowPinModal(false);
            setStep(4);
        } else {
            setError('Transaction failed. Internal error.');
        }
    } catch (e: any) {
        setError(e.message || "Transaction failed");
    } finally {
        setIsLoading(false);
    }
  };

  const setMaxAmount = () => {
      setAmount(user.balance.toString());
  };

  const addAmount = (val: number) => {
      const current = parseFloat(amount) || 0;
      setAmount((current + val).toString());
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4 animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        {step > 1 && step < 4 && (
            <button onClick={() => setStep(prev => (prev - 1) as any)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
            </button>
        )}
        <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
            {step === 1 && 'Recipient'}
            {step === 2 && 'Amount'}
            {step === 3 && 'Confirmation'}
            {step === 4 && 'Success'}
        </h1>
      </div>

      {step === 1 && (
        <div className="space-y-6">
             <Card className="p-6">
                <form onSubmit={handleVerifyRecipient} className="space-y-4">
                    <Input 
                        label="Send To" 
                        placeholder="Email or Account Number" 
                        icon={<Search size={18} />}
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        error={error}
                        autoFocus
                    />
                    <Button type="submit" className="w-full" isLoading={isLoading}>Continue</Button>
                </form>
             </Card>

             {recentRecipients.length > 0 && (
                 <div>
                     <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Recent Contacts</h3>
                     <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                         {recentRecipients.map((contact, i) => (
                             <div 
                                key={i} 
                                onClick={() => handleSelectContact(contact)}
                                className="flex flex-col items-center gap-2 min-w-[80px] cursor-pointer group"
                             >
                                 <div className="relative">
                                     <img src={contact.avatar} alt={contact.name} className="w-12 h-12 rounded-full border-2 border-transparent group-hover:border-brand-500 transition-colors object-cover" />
                                     <div className="absolute bottom-0 right-0 w-4 h-4 bg-brand-500 rounded-full border-2 border-white flex items-center justify-center">
                                         <Clock size={8} className="text-white" />
                                     </div>
                                 </div>
                                 <span className="text-[10px] font-bold text-center truncate w-full text-gray-700 dark:text-gray-300">{contact.name.split(' ')[0]}</span>
                             </div>
                         ))}
                     </div>
                 </div>
             )}
             
             <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl flex gap-3 border border-blue-100 dark:border-blue-900/30">
                 <ShieldCheck className="text-blue-600 shrink-0" size={20} />
                 <div>
                     <h4 className="font-black text-[10px] uppercase tracking-wider text-blue-900 dark:text-blue-300">Secure Transfer</h4>
                     <p className="text-[10px] font-medium text-blue-700 dark:text-blue-400 mt-1">Direct bank-to-bank transfers are instant and protected.</p>
                 </div>
             </div>
        </div>
      )}

      {step === 2 && (
        <Card className="p-8">
            <div className="flex flex-col items-center mb-8">
                <img src={selectedContact?.avatarUrl} alt="" className="w-16 h-16 rounded-full mb-3 shadow-lg border-2 border-brand-100" />
                <h3 className="text-lg font-black text-brand-900 dark:text-white uppercase tracking-tight">{selectedContact?.name}</h3>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{selectedContact?.email}</p>
            </div>

            <form onSubmit={handleAmountSubmit} className="space-y-6">
                <div className="relative">
                    <div className="flex items-center justify-center">
                        <span className="text-3xl font-black text-gray-300 mr-1">$</span>
                        <input 
                            type="number" 
                            className="text-5xl font-black text-gray-900 dark:text-white bg-transparent border-none focus:ring-0 w-full text-center placeholder-gray-100 tracking-tighter" 
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <p className="text-center text-[10px] font-black uppercase text-gray-400 mt-2 tracking-widest">
                        Available: <span className="text-brand-600">${user.balance.toLocaleString()}</span>
                        <button type="button" onClick={setMaxAmount} className="ml-2 text-brand-600 hover:underline">USE MAX</button>
                    </p>
                </div>

                <div className="flex justify-center gap-2">
                    {[50, 100, 500].map(val => (
                        <button 
                            key={val}
                            type="button"
                            onClick={() => addAmount(val)}
                            className="px-3 py-1 rounded-lg bg-gray-50 dark:bg-gray-800 text-[10px] font-black uppercase text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            +${val}
                        </button>
                    ))}
                </div>

                <Input 
                    placeholder="Reference (Optional)" 
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    className="text-center"
                />

                {error && <p className="text-red-500 text-center text-[10px] font-bold uppercase">{error}</p>}

                <Button type="submit" className="w-full h-12 text-sm uppercase font-black tracking-widest bg-brand-700">Confirm Amount</Button>
            </form>
        </Card>
      )}

      {step === 3 && (
          <div className="space-y-6">
              <Card className="p-6 overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-brand-600"></div>
                  <h3 className="text-gray-400 text-[9px] font-black uppercase tracking-[0.2em] mb-6">Review Details</h3>
                  
                  <div className="flex items-center justify-between mb-8">
                      <div className="text-center">
                          <img src={user.avatarUrl} alt="" className="w-10 h-10 rounded-full mx-auto mb-2 border-2 border-brand-50" />
                          <p className="text-[10px] font-black uppercase text-gray-900 dark:text-white">You</p>
                      </div>
                      <div className="flex-1 px-4 flex flex-col items-center">
                          <div className="w-full h-px bg-gray-100 dark:bg-gray-800 relative">
                              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 px-2">
                                  <ArrowRight size={14} className="text-brand-500" />
                              </div>
                          </div>
                      </div>
                      <div className="text-center">
                          <img src={selectedContact?.avatarUrl} alt="" className="w-10 h-10 rounded-full mx-auto mb-2 border-2 border-brand-50" />
                          <p className="text-[10px] font-black uppercase text-gray-900 dark:text-white">{selectedContact?.name.split(' ')[0]}</p>
                      </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 space-y-4">
                      <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-gray-400 uppercase">Amount</span>
                          <span className="font-black text-lg">${parseFloat(amount).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-gray-400 uppercase">Transfer Fee</span>
                          <span className="text-[10px] font-black text-emerald-500 uppercase">FREE</span>
                      </div>
                      {note && (
                         <div className="flex justify-between items-center border-t border-gray-100 dark:border-gray-800 pt-3">
                            <span className="text-[10px] font-black text-gray-400 uppercase">Note</span>
                            <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300">{note}</span>
                         </div>
                      )}
                      <div className="border-t-2 border-brand-100 dark:border-brand-800 pt-3 flex justify-between items-center">
                          <span className="text-[10px] font-black text-brand-900 dark:text-white uppercase tracking-wider">Total Charge</span>
                          <span className="font-black text-xl text-brand-700 dark:text-brand-400">${parseFloat(amount).toFixed(2)}</span>
                      </div>
                  </div>
              </Card>

              {error && <p className="text-red-500 text-center text-[10px] font-bold uppercase">{error}</p>}

              <Button onClick={initiateTransfer} className="w-full h-14 text-sm font-black uppercase tracking-widest shadow-xl shadow-brand-700/20 bg-brand-700">
                  Authorize & Send
              </Button>
              
              <button onClick={() => setStep(2)} className="w-full text-center text-[9px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 p-2">
                  Edit Amount
              </button>
          </div>
      )}

      {step === 4 && (
        <div className="text-center py-10 animate-scale-up">
            <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <CheckCircle2 size={40} />
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2">Transfer Sent!</h2>
            <p className="text-[11px] font-medium text-gray-500 mb-8 max-w-xs mx-auto">
                You sent <span className="text-brand-700 dark:text-brand-400 font-black">${parseFloat(amount).toFixed(2)}</span> to <span className="font-black uppercase">{selectedContact?.name}</span>.
            </p>
            
            <Card className="p-4 mb-8 max-w-xs mx-auto bg-gray-50 dark:bg-gray-800/50 border-brand-50">
                <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-wider mb-2">
                    <span className="text-gray-400">Transaction ID</span>
                    <span className="text-gray-700 dark:text-gray-300">#TXN-{Math.floor(Math.random()*100000)}</span>
                </div>
                <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-wider">
                    <span className="text-gray-400">Timestamp</span>
                    <span className="text-gray-700 dark:text-gray-300">{new Date().toLocaleTimeString()}</span>
                </div>
            </Card>

            <div className="flex flex-col gap-3 max-w-xs mx-auto">
                <Button onClick={() => navigate('/dashboard')} className="w-full bg-brand-700 uppercase font-black text-[10px] tracking-widest">
                    Dashboard
                </Button>
                <Button variant="outline" onClick={() => {
                    setStep(1);
                    setAmount('');
                    setNote('');
                    setRecipient('');
                    setSelectedContact(null);
                }} className="uppercase font-black text-[10px] tracking-widest">
                    New Transfer
                </Button>
            </div>
        </div>
      )}

      {/* PIN Verification Modal */}
      <Modal isOpen={showPinModal} onClose={() => setShowPinModal(false)} title="Security Check">
          <form onSubmit={handleFinalTransfer}>
              <div className="text-center mb-6">
                <div className="w-10 h-10 bg-brand-50 text-brand-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Key size={20} />
                </div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Enter 4-digit PIN to confirm</p>
              </div>
              <Input 
                type="password"
                placeholder="0000"
                maxLength={4}
                className="text-center text-3xl tracking-[0.5em] font-black h-16 bg-gray-50 border-brand-100"
                value={pin}
                onChange={e => setPin(e.target.value)}
                autoFocus
              />
              {error && <p className="text-red-500 text-[10px] font-bold text-center mt-2 uppercase">{error}</p>}
              <div className="mt-6 flex gap-3">
                  <Button type="button" variant="ghost" onClick={() => setShowPinModal(false)} className="flex-1 uppercase text-[10px] font-black tracking-widest">Cancel</Button>
                  <Button type="submit" isLoading={isLoading} disabled={pin.length !== 4} className="flex-1 bg-brand-700 uppercase text-[10px] font-black tracking-widest">Authorize</Button>
              </div>
          </form>
      </Modal>
    </div>
  );
};