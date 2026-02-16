
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
  const { user, sendMoney, recentRecipients } = useGlobal();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [recipient, setRecipient] = useState('');
  const [selectedContact, setSelectedContact] = useState<{name: string, email: string, avatar: string} | null>(null);
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
        // Simulate selection/verification visuals
        setSelectedContact({
            name: toParam,
            email: toParam,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(toParam)}&background=random`
        });
        
        // If amount is also present, we can't fully auto-submit, but we can progress UI
        if (amountParam) {
            setAmount(amountParam);
        }
        setStep(2);
    }
  }, [searchParams]);

  const handleSelectContact = (contact: {name: string, email: string, avatar: string}) => {
      setSelectedContact(contact);
      setRecipient(contact.email);
      setStep(2);
      setError('');
  };

  const handleVerifyRecipient = (e: React.FormEvent) => {
    e.preventDefault();
    if (recipient.length < 3) {
      setError('Please enter a valid email or account number');
      return;
    }
    setSelectedContact({
        name: recipient,
        email: recipient,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(recipient)}&background=random`
    });
    setError('');
    setStep(2);
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
            setError('Transaction failed. Recipient may not exist.');
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {step === 1 && 'Send Money'}
            {step === 2 && 'Enter Amount'}
            {step === 3 && 'Review Details'}
            {step === 4 && 'Transfer Complete'}
        </h1>
      </div>

      {step === 1 && (
        <div className="space-y-6">
             <Card className="p-6">
                <form onSubmit={handleVerifyRecipient} className="space-y-4">
                    <Input 
                        label="To" 
                        placeholder="Search name, email, or account number" 
                        icon={<Search size={18} />}
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        error={error}
                        autoFocus
                    />
                    <Button type="submit" className="w-full">Continue</Button>
                </form>
             </Card>

             {recentRecipients.length > 0 && (
                 <div>
                     <h3 className="text-sm font-semibold text-gray-500 mb-3 px-1">Recent Recipients</h3>
                     <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                         {recentRecipients.map((contact, i) => (
                             <div 
                                key={i} 
                                onClick={() => handleSelectContact(contact)}
                                className="flex flex-col items-center gap-2 min-w-[80px] cursor-pointer group"
                             >
                                 <div className="relative">
                                     <img src={contact.avatar} alt={contact.name} className="w-14 h-14 rounded-full border-2 border-transparent group-hover:border-brand-500 transition-colors object-cover" />
                                     <div className="absolute bottom-0 right-0 w-4 h-4 bg-brand-500 rounded-full border-2 border-white flex items-center justify-center">
                                         <Clock size={8} className="text-white" />
                                     </div>
                                 </div>
                                 <span className="text-xs font-medium text-center truncate w-full">{contact.name.split(' ')[0]}</span>
                             </div>
                         ))}
                     </div>
                 </div>
             )}
             
             <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl flex gap-3 border border-blue-100 dark:border-blue-900/30">
                 <ShieldCheck className="text-blue-600 shrink-0" />
                 <div>
                     <h4 className="font-bold text-sm text-blue-900 dark:text-blue-300">Secure Transfer</h4>
                     <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">Transfers to Git. Broker accounts are instant, free, and protected by our escrow safety protocols.</p>
                 </div>
             </div>
        </div>
      )}

      {step === 2 && (
        <Card className="p-8">
            <div className="flex flex-col items-center mb-8">
                <img src={selectedContact?.avatar} alt="" className="w-16 h-16 rounded-full mb-3 shadow-lg" />
                <h3 className="text-lg font-bold">{selectedContact?.name}</h3>
                <p className="text-sm text-gray-500">{selectedContact?.email}</p>
            </div>

            <form onSubmit={handleAmountSubmit} className="space-y-6">
                <div className="relative">
                    <div className="flex items-center justify-center">
                        <span className="text-4xl font-bold text-gray-400 mr-1">$</span>
                        <input 
                            type="number" 
                            className="text-5xl font-bold text-gray-900 dark:text-white bg-transparent border-none focus:ring-0 w-48 text-center placeholder-gray-200" 
                            placeholder="0"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <p className="text-center text-sm text-gray-500 mt-2">
                        Balance: ${user.balance.toLocaleString()} 
                        <button type="button" onClick={setMaxAmount} className="text-brand-600 font-bold ml-2 hover:underline">MAX</button>
                    </p>
                </div>

                <div className="flex justify-center gap-2">
                    {[50, 100, 500].map(val => (
                        <button 
                            key={val}
                            type="button"
                            onClick={() => addAmount(val)}
                            className="px-4 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            +${val}
                        </button>
                    ))}
                </div>

                <Input 
                    placeholder="Add a note (optional)" 
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    className="text-center"
                />

                {error && <p className="text-red-500 text-center text-sm">{error}</p>}

                <Button type="submit" className="w-full h-12 text-lg">Review Transfer</Button>
            </form>
        </Card>
      )}

      {step === 3 && (
          <div className="space-y-6">
              <Card className="p-6 overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-full h-2 bg-brand-500"></div>
                  <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wide mb-6">Transaction Summary</h3>
                  
                  <div className="flex items-center justify-between mb-6">
                      <div className="text-center">
                          <img src={user.avatarUrl} alt="" className="w-12 h-12 rounded-full mx-auto mb-2 bg-gray-200" />
                          <p className="text-sm font-bold">You</p>
                      </div>
                      <div className="flex-1 px-4 flex flex-col items-center">
                          <div className="w-full h-px bg-gray-200 dark:bg-gray-700 relative">
                              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 px-2">
                                  <ArrowRight size={16} className="text-gray-400" />
                              </div>
                          </div>
                      </div>
                      <div className="text-center">
                          <img src={selectedContact?.avatar} alt="" className="w-12 h-12 rounded-full mx-auto mb-2 bg-gray-200" />
                          <p className="text-sm font-bold">{selectedContact?.name.split(' ')[0]}</p>
                      </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-3">
                      <div className="flex justify-between items-center">
                          <span className="text-gray-500">Amount</span>
                          <span className="font-bold text-xl">${parseFloat(amount).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                          <span className="text-gray-500">Fee</span>
                          <span className="font-medium text-green-600">Free</span>
                      </div>
                      {note && (
                         <div className="flex justify-between items-center">
                            <span className="text-gray-500">Note</span>
                            <span className="font-medium text-gray-900 dark:text-gray-300">{note}</span>
                         </div>
                      )}
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between items-center">
                          <span className="font-bold text-gray-900 dark:text-white">Total</span>
                          <span className="font-bold text-xl text-brand-600">${parseFloat(amount).toFixed(2)}</span>
                      </div>
                  </div>
              </Card>

              {error && <p className="text-red-500 text-center text-sm">{error}</p>}

              <Button onClick={initiateTransfer} className="w-full h-14 text-lg shadow-xl shadow-brand-500/20">
                  Confirm & Send
              </Button>
              
              <button onClick={() => setStep(2)} className="w-full text-center text-sm text-gray-500 hover:text-gray-700 p-2">
                  Cancel
              </button>
          </div>
      )}

      {step === 4 && (
        <div className="text-center py-10 animate-scale-up">
            <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/20">
                <CheckCircle2 size={48} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Transfer Successful!</h2>
            <p className="text-gray-500 mb-8 max-w-xs mx-auto">
                You successfully sent <span className="text-gray-900 dark:text-white font-bold">${parseFloat(amount).toFixed(2)}</span> to {selectedContact?.name}.
            </p>
            
            <Card className="p-4 mb-8 max-w-xs mx-auto bg-gray-50 dark:bg-gray-800/50">
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">Transaction ID</span>
                    <span className="font-mono">#TRX-{Math.floor(Math.random()*100000)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Date</span>
                    <span>{new Date().toLocaleDateString()}</span>
                </div>
            </Card>

            <div className="flex flex-col gap-3 max-w-xs mx-auto">
                <Button onClick={() => navigate('/dashboard')} className="w-full">
                    Return to Dashboard
                </Button>
                <Button variant="outline" onClick={() => {
                    setStep(1);
                    setAmount('');
                    setNote('');
                    setRecipient('');
                    setSelectedContact(null);
                }}>
                    Make Another Transfer
                </Button>
            </div>
        </div>
      )}

      {/* PIN Verification Modal */}
      <Modal isOpen={showPinModal} onClose={() => setShowPinModal(false)} title="Security Verification">
          <form onSubmit={handleFinalTransfer}>
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Key size={24} />
                </div>
                <p className="text-sm text-gray-500">Enter your 4-digit Transaction PIN to authorize this transfer.</p>
              </div>
              <Input 
                type="password"
                placeholder="0000"
                maxLength={4}
                className="text-center text-3xl tracking-[1em] font-mono h-16"
                value={pin}
                onChange={e => setPin(e.target.value)}
                autoFocus
              />
              {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
              <div className="mt-6 flex gap-3">
                  <Button type="button" variant="ghost" onClick={() => setShowPinModal(false)} className="flex-1">Cancel</Button>
                  <Button type="submit" isLoading={isLoading} disabled={pin.length !== 4} className="flex-1">Verify & Pay</Button>
              </div>
          </form>
      </Modal>
    </div>
  );
};
