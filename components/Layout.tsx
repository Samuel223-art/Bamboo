import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Wallet, 
  Send, 
  ShieldCheck, 
  History, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Bell, 
  Sun, 
  Moon,
  Search,
  User,
  Trees,
  Plus
} from 'lucide-react';
import { useGlobal } from '../context/GlobalState';

const SidebarLink: React.FC<{ to: string; icon: React.ReactNode; label: string; onClick?: () => void }> = ({ to, icon, label, onClick }) => (
  <NavLink 
    to={to} 
    onClick={onClick}
    className={({ isActive }) => `
      flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all duration-200
      ${isActive 
        ? 'bg-brand-100 text-brand-800 dark:bg-brand-900/30 dark:text-brand-400 font-bold' 
        : 'text-gray-600 dark:text-gray-400 hover:bg-brand-50 dark:hover:bg-brand-900/10 hover:text-brand-700 dark:hover:text-brand-200'}
    `}
  >
    {icon}
    <span>{label}</span>
  </NavLink>
);

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, theme, toggleTheme, notifications } = useGlobal();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-brand-50 dark:bg-brand-950 flex transition-colors duration-200">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-brand-900/20 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-brand-900 border-r border-brand-100 dark:border-brand-800 transform transition-transform duration-300 ease-in-out flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-20 flex items-center px-6 border-b border-brand-50 dark:border-brand-800">
          <div className="flex items-center gap-2">
            <div className="bg-brand-600 p-1.5 rounded-lg">
              <Trees className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold text-brand-900 dark:text-brand-50">Bamboo Bank</span>
          </div>
          <button className="ml-auto lg:hidden text-gray-500" onClick={() => setSidebarOpen(false)}><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          <SidebarLink to="/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" onClick={() => setSidebarOpen(false)} />
          <SidebarLink to="/wallet" icon={<Wallet size={20} />} label="My Wallet" onClick={() => setSidebarOpen(false)} />
          <SidebarLink to="/transactions" icon={<History size={20} />} label="Transactions" onClick={() => setSidebarOpen(false)} />
          <SidebarLink to="/broker" icon={<ShieldCheck size={20} />} label="Escrow Service" onClick={() => setSidebarOpen(false)} />
          
          <div className="px-3 pt-6 pb-2">
            <p className="text-[10px] font-bold text-brand-400 dark:text-brand-500 uppercase tracking-widest px-1">Quick Actions</p>
          </div>
          <div className="px-3 space-y-2">
            <Link 
              to="/send" 
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-sm shadow-md shadow-brand-600/20 hover:bg-brand-700 transition-all active:scale-95"
            >
              <Send size={18} />
              <span>Send Money</span>
            </Link>
            <Link 
              to="/broker?create=true" 
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-brand-200 dark:border-brand-700 text-brand-700 dark:text-brand-300 font-bold text-sm hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all active:scale-95"
            >
              <Plus size={18} />
              <span>Create Deal</span>
            </Link>
          </div>

          <div className="pt-4 mt-4 border-t border-brand-50 dark:border-brand-800">
             <SidebarLink to="/profile" icon={<User size={20} />} label="Profile" onClick={() => setSidebarOpen(false)} />
             <SidebarLink to="/settings" icon={<Settings size={20} />} label="Settings" onClick={() => setSidebarOpen(false)} />
          </div>
        </div>

        <div className="p-4 border-t border-brand-50 dark:border-brand-800">
          <div className="flex items-center gap-3 mb-4 p-2 rounded-xl bg-brand-50 dark:bg-brand-800/50">
            <img src={user?.avatarUrl || "https://ui-avatars.com/api/?name=User"} alt="Profile" className="w-10 h-10 rounded-full border-2 border-brand-200" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-brand-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-xs text-brand-600 dark:text-brand-400 truncate">Bamboo Member</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <LogOut size={16} /><span>Sign Out</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white dark:bg-brand-900 border-b border-brand-50 dark:border-brand-800 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <button className="lg:hidden text-brand-600" onClick={() => setSidebarOpen(true)}><Menu size={24} /></button>
          <div className="hidden md:flex items-center max-w-md w-full ml-4">
             <div className="relative w-full">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-400" size={18} />
               <input type="text" placeholder="Search transactions..." className="w-full bg-brand-50 dark:bg-brand-800 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-brand-500" />
             </div>
          </div>
          <div className="flex items-center gap-2 lg:gap-4 ml-auto">
            <button onClick={toggleTheme} className="p-2 text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-800 rounded-lg">{theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}</button>
            <button onClick={() => navigate('/notifications')} className="p-2 text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-800 rounded-lg relative">
                <Bell size={20} />
                {notifications.some(n => !n.read) && <span className="absolute top-2 right-2 w-2 h-2 bg-brand-500 rounded-full"></span>}
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};