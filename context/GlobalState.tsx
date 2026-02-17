import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Transaction, Deal, Notification, Contact, ActivityData } from '../types';
import { auth, db } from '../firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut, 
  createUserWithEmailAndPassword,
  updatePassword
} from 'firebase/auth';
import { 
  doc, 
  onSnapshot, 
  setDoc, 
  collection, 
  query, 
  where, 
  runTransaction,
  serverTimestamp,
  getDocs,
  updateDoc,
  or
} from 'firebase/firestore';

interface GlobalContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  transactions: Transaction[];
  deals: Deal[];
  notifications: Notification[];
  recentRecipients: Contact[];
  activityData: ActivityData[];
  sendMoney: (amount: number, recipientEmail: string, note: string, pin: string) => Promise<boolean>;
  releaseDeal: (id: string) => Promise<void>;
  acceptDeal: (id: string) => Promise<void>;
  createDeal: (dealData: { title: string; amount: number; counterpartyEmail: string; description: string; task: string }) => Promise<boolean>;
  updateTransactionPin: (pin: string) => Promise<void>;
  changeUserPassword: (newPassword: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [recentRecipients, setRecentRecipients] = useState<Contact[]>([]);
  const [activityData, setActivityData] = useState<ActivityData[]>([]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const formatDate = (date: any) => {
    if (!date) return new Date().toISOString();
    if (date.toDate) return date.toDate().toISOString();
    return new Date(date).toISOString();
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        const unsubscribeUser = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setUser({ id: docSnap.id, ...docSnap.data() } as User);
          }
          setLoading(false);
        });

        const qTransactions = query(
          collection(db, 'transactions'),
          where('userId', '==', currentUser.uid)
        );
        const unsubscribeTransactions = onSnapshot(qTransactions, (snapshot) => {
          const txs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            date: formatDate(doc.data().date)
          })) as Transaction[];
          
          txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setTransactions(txs);
          
          const notifs: Notification[] = txs.map(tx => ({
              id: `notif-${tx.id}`,
              date: tx.date,
              read: false,
              type: tx.status === 'failed' ? 'error' : 'success',
              title: tx.status === 'failed' ? 'Transfer Failed' : 
                     tx.type === 'deposit' ? 'Green Credit Received' : 
                     tx.type === 'transfer' ? 'Funds Dispatched' : 'Notification',
              message: tx.description
          }));

          notifs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setNotifications(notifs.slice(0, 20));
          
          const uniqueRecipients = new Map<string, Contact>();
          txs.forEach(tx => {
            if (tx.type === 'transfer' && tx.recipientEmail && tx.recipient) {
                if (!uniqueRecipients.has(tx.recipientEmail)) {
                    uniqueRecipients.set(tx.recipientEmail, {
                        name: tx.recipient,
                        email: tx.recipientEmail,
                        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(tx.recipient)}&background=166534&color=ffffff`
                    });
                }
            }
          });
          setRecentRecipients(Array.from(uniqueRecipients.values()).slice(0, 10));
        });

        const qDeals = query(
            collection(db, 'deals'),
            or(
                where('creatorId', '==', currentUser.uid),
                where('counterpartyId', '==', currentUser.uid)
            )
        );

        const unsubscribeDeals = onSnapshot(qDeals, (snapshot) => {
          const dls = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            dateCreated: formatDate(doc.data().dateCreated)
          })) as Deal[];
          
          dls.sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime());
          setDeals(dls);
        });

        return () => {
          unsubscribeUser();
          unsubscribeTransactions();
          unsubscribeDeals();
        };
      } else {
        setUser(null);
        setTransactions([]);
        setDeals([]);
        setNotifications([]);
        setActivityData([]);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!transactions || transactions.length === 0) {
        setActivityData([]);
        return;
    }
    const today = new Date();
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        days.push(d);
    }
    const data: ActivityData[] = days.map(dayDate => {
        const dateStr = dayDate.toISOString().split('T')[0];
        const dayTxs = transactions.filter(t => t.date.split('T')[0] === dateStr);
        let income = 0;
        let expense = 0;
        dayTxs.forEach(t => {
            if (t.type === 'deposit' || t.type === 'commission') income += t.amount;
            else expense += t.amount;
        });
        return {
            day: dayDate.toLocaleDateString('en-US', { weekday: 'short' }),
            date: dateStr,
            income,
            expense
        };
    });
    setActivityData(data);
  }, [transactions]);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email: string, password: string, name: string) => {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const generatedNumber = `BM-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    await setDoc(doc(db, 'users', res.user.uid), {
      id: res.user.uid,
      name,
      email,
      role: 'user',
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=166534&color=ffffff`,
      accountNumber: generatedNumber,
      phoneNumber: '',
      country: '',
      address: '',
      bankName: 'Bamboo Global Bank',
      balance: 0.00, // Updated to 0.00 as requested
      escrowBalance: 0,
      kycStatus: 'unverified'
    });
  };

  const logout = () => signOut(auth);

  const updateTransactionPin = async (pin: string) => {
      if (!user) throw new Error("Not authenticated");
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, { transactionPin: pin });
  };

  const changeUserPassword = async (newPassword: string) => {
      if (!auth.currentUser) throw new Error("Not authenticated");
      await updatePassword(auth.currentUser, newPassword);
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) throw new Error("Not authenticated");
    const userRef = doc(db, 'users', user.id);
    await updateDoc(userRef, data);
  };

  const sendMoney = async (amount: number, recipientEmail: string, note: string, pin: string): Promise<boolean> => {
    if (!user) return false;
    if (user.transactionPin && user.transactionPin !== pin) throw new Error("Invalid Transaction PIN");
    try {
      await runTransaction(db, async (transaction) => {
        const senderRef = doc(db, 'users', user.id);
        const senderDoc = await transaction.get(senderRef);
        if (!senderDoc.exists()) throw "Sender error";
        if (senderDoc.data().balance < amount) throw "Insufficient funds";

        let q = query(collection(db, 'users'), where('email', '==', recipientEmail));
        let querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
             q = query(collection(db, 'users'), where('accountNumber', '==', recipientEmail));
             querySnapshot = await getDocs(q);
        }
        if (querySnapshot.empty) throw "Recipient not found";
        const recipientDoc = querySnapshot.docs[0];
        const recipientRef = doc(db, 'users', recipientDoc.id);

        transaction.update(senderRef, { balance: senderDoc.data().balance - amount });
        transaction.update(recipientRef, { balance: recipientDoc.data().balance + amount });

        transaction.set(doc(collection(db, 'transactions')), {
            userId: user.id,
            type: 'transfer',
            amount,
            date: serverTimestamp(),
            status: 'completed',
            recipient: recipientDoc.data().name,
            recipientEmail: recipientDoc.data().email,
            description: `Bamboo Send to ${recipientDoc.data().name}: ${note}`
        });

        transaction.set(doc(collection(db, 'transactions')), {
            userId: recipientDoc.id,
            type: 'deposit',
            amount,
            date: serverTimestamp(),
            status: 'completed',
            sender: user.name,
            senderEmail: user.email,
            description: `Bamboo Deposit from ${user.name}: ${note}`
        });
      });
      return true;
    } catch (e: any) { throw e; }
  };

  const createDeal = async (dealData: { title: string; amount: number; counterpartyEmail: string; description: string; task: string }) => {
    if (!user) return false;
    try {
        const q = query(collection(db, 'users'), where('email', '==', dealData.counterpartyEmail));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) throw new Error("Counterparty not found.");
        const counterpartyDoc = querySnapshot.docs[0];

        await runTransaction(db, async (transaction) => {
            const userRef = doc(db, 'users', user.id);
            const userDoc = await transaction.get(userRef);
            if (userDoc.data()!.balance < dealData.amount) throw "Insufficient funds";
            transaction.update(userRef, {
                balance: userDoc.data()!.balance - dealData.amount,
                escrowBalance: (userDoc.data()!.escrowBalance || 0) + dealData.amount
            });
            transaction.set(doc(collection(db, 'deals')), {
                creatorId: user.id, creatorName: user.name, creatorEmail: user.email,
                counterpartyId: counterpartyDoc.id, counterpartyName: counterpartyDoc.data().name, counterpartyEmail: counterpartyDoc.data().email,
                title: dealData.title, amount: dealData.amount, commission: dealData.amount * 0.05,
                status: 'pending_acceptance', dateCreated: serverTimestamp(), description: dealData.description, task: dealData.task
            });
            transaction.set(doc(collection(db, 'transactions')), {
                userId: user.id, type: 'transfer', amount: dealData.amount,
                date: serverTimestamp(), status: 'completed', description: `Organic Escrow Hold: ${dealData.title}`
            });
        });
        return true;
    } catch (e) { return false; }
  };

  const acceptDeal = async (id: string) => {
      if (!user) return;
      await runTransaction(db, async (transaction) => {
          const dealRef = doc(db, 'deals', id);
          const dealDoc = await transaction.get(dealRef);
          if (dealDoc.data()!.counterpartyId === user.id) transaction.update(dealRef, { status: 'active' });
      });
  };

  const releaseDeal = async (id: string) => {
    if (!user) return;
    await runTransaction(db, async (transaction) => {
        const dealRef = doc(db, 'deals', id);
        const dealDoc = await transaction.get(dealRef);
        const dealData = dealDoc.data()!;
        if (dealData.creatorId !== user.id) throw "Not authorized";
        const creatorRef = doc(db, 'users', user.id);
        const creatorDoc = await transaction.get(creatorRef);
        const counterpartyRef = doc(db, 'users', dealData.counterpartyId);
        const counterpartyDoc = await transaction.get(counterpartyRef);

        transaction.update(creatorRef, { escrowBalance: creatorDoc.data()!.escrowBalance - dealData.amount });
        const netAmount = dealData.amount - dealData.commission;
        transaction.update(counterpartyRef, { balance: counterpartyDoc.data()!.balance + netAmount });
        transaction.update(dealRef, { status: 'completed' });
        transaction.set(doc(collection(db, 'transactions')), {
            userId: dealData.counterpartyId, type: 'deposit', amount: netAmount,
            date: serverTimestamp(), status: 'completed', sender: user.name, description: `Escrow Released: ${dealData.title}`
        });
    });
  };

  return (
    <GlobalContext.Provider value={{ 
        theme, toggleTheme, user, loading, login, signup, logout, 
        transactions, deals, notifications, recentRecipients, activityData,
        sendMoney, releaseDeal, acceptDeal, createDeal, 
        updateTransactionPin, changeUserPassword, updateProfile
    }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobal = () => {
  const context = useContext(GlobalContext);
  if (!context) throw new Error('useGlobal must be used within GlobalProvider');
  return context;
};