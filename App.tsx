import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { GlobalProvider, useGlobal } from './context/GlobalState';
import { Layout } from './components/Layout';
import { Loader2 } from 'lucide-react';

// Pages
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { SendMoney } from './pages/SendMoney';
import { Broker } from './pages/Broker';
import { Admin } from './pages/Admin';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { Notifications } from './pages/Notifications';
import { Card, TransactionRow } from './components/UIComponents';

const WalletPage = () => {
    const { user, transactions } = useGlobal();
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold dark:text-white">My Wallet</h1>
            <Card className="p-8 max-w-2xl bg-gradient-to-r from-brand-700 to-brand-900 text-white shadow-xl shadow-brand-900/20">
                <p className="text-brand-200 mb-2">Account Number</p>
                <div className="text-3xl font-mono mb-6 tracking-wider">{user?.accountNumber}</div>
                <div className="flex justify-between text-sm text-brand-100">
                    <div>
                        <p className="text-brand-300 text-xs uppercase mb-1">Bank Name</p>
                        <p>{user?.bankName}</p>
                    </div>
                    <div>
                        <p className="text-brand-300 text-xs uppercase mb-1">Account Holder</p>
                        <p>{user?.name}</p>
                    </div>
                    <div>
                        <p className="text-brand-300 text-xs uppercase mb-1">Status</p>
                        <span className="text-emerald-400">Active</span>
                    </div>
                </div>
            </Card>
            <h3 className="text-lg font-bold mt-8 dark:text-white">Recent Activity</h3>
            <Card className="p-4">
                 {transactions.length > 0 ? (
                    transactions.map(t => <TransactionRow key={t.id} transaction={t} />)
                 ) : <p className="text-center py-10 text-gray-500">No transactions yet.</p>}
            </Card>
        </div>
    )
};

const TransactionsPage = () => {
    const { transactions } = useGlobal();
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold dark:text-white">Transaction History</h1>
            <Card className="p-4">
                {transactions.length > 0 ? (
                    transactions.map(t => <TransactionRow key={t.id} transaction={t} />)
                ) : (
                    <p className="text-gray-500 text-center py-4">No transactions found.</p>
                )}
            </Card>
        </div>
    )
};

const ProtectedRoute = () => {
  const { user, loading } = useGlobal();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-brand-50"><Loader2 className="w-8 h-8 animate-spin text-brand-600" /></div>;
  if (!user) return <Navigate to="/auth" replace />;
  return <Layout><Outlet /></Layout>;
};

const AppContent = () => {
  const { user } = useGlobal();
  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/auth" />} />
      <Route path="/auth" element={<Auth />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/send" element={<SendMoney />} />
        <Route path="/broker" element={<Broker />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/admin" element={<Admin />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <HashRouter>
      <GlobalProvider>
        <AppContent />
      </GlobalProvider>
    </HashRouter>
  );
}