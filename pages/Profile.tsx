

import React, { useState, useEffect } from 'react';
import { useGlobal } from '../context/GlobalState';
import { Card, Button, Input, StatusBadge } from '../components/UIComponents';
import { 
  User, 
  Camera,
  Mail,
  Phone,
  MapPin,
  LogOut,
  Globe,
  Save,
  Loader2
} from 'lucide-react';

export const Profile = () => {
  const { user, logout, updateProfile } = useGlobal();
  
  const [formData, setFormData] = useState({
      phoneNumber: '',
      country: '',
      address: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
      if (user) {
          setFormData({
              phoneNumber: user.phoneNumber || '',
              country: user.country || '',
              address: user.address || ''
          });
      }
  }, [user]);

  if (!user) return null;

  const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSaving(true);
      setMessage({ text: '', type: '' });
      try {
          await updateProfile(formData);
          setMessage({ text: 'Profile updated successfully!', type: 'success' });
      } catch (err) {
          setMessage({ text: 'Failed to update profile.', type: 'error' });
      } finally {
          setIsSaving(false);
      }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-brand-900 dark:text-white tracking-tight">Account Profile</h1>
          <p className="text-brand-600 dark:text-brand-400 font-medium">Manage your personal banking details</p>
        </div>
        {/* Fixed: Removed duplicate 'variant' attribute */}
        <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50" onClick={logout}>
          <LogOut size={16} className="mr-2" /> Sign Out
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Avatar and Status */}
        <div className="space-y-6">
            <Card className="p-8 flex flex-col items-center text-center shadow-lg border-brand-50">
                <div className="relative group mb-6">
                    <div className="w-40 h-40 rounded-full border-8 border-brand-50 dark:border-brand-900/50 bg-brand-100 overflow-hidden shadow-inner">
                        <img src={user.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                    </div>
                    <button className="absolute bottom-2 right-2 p-3 bg-brand-600 text-white rounded-full shadow-xl hover:bg-brand-700 transition-all scale-100 active:scale-95">
                        <Camera size={20} />
                    </button>
                </div>
                <h2 className="text-2xl font-bold text-brand-900 dark:text-white">{user.name}</h2>
                <p className="text-brand-600 dark:text-brand-400 text-sm mb-4 font-medium">{user.email}</p>
                <div className="flex flex-col gap-3 w-full">
                    <div className="flex items-center justify-between p-3 bg-brand-50 dark:bg-brand-900/20 rounded-xl border border-brand-100 dark:border-brand-800">
                        <span className="text-[10px] font-black uppercase text-brand-400">Account Status</span>
                        <StatusBadge status={user.kycStatus} />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-brand-50 dark:bg-brand-900/20 rounded-xl border border-brand-100 dark:border-brand-800">
                        <span className="text-[10px] font-black uppercase text-brand-400">Account Type</span>
                        <span className="text-xs font-bold text-brand-700 dark:text-brand-300">Personal Banking</span>
                    </div>
                </div>
            </Card>
        </div>

        {/* Right column: Form */}
        <div className="lg:col-span-2 space-y-6">
            <Card className="p-8 shadow-lg border-brand-50">
                <h3 className="text-xl font-bold text-brand-900 dark:text-white mb-8 pb-4 border-b border-brand-50 dark:border-brand-800">Personal Information</h3>
                
                <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="opacity-60">
                            <Input 
                                label="Full Name (Read Only)" 
                                value={user.name} 
                                icon={<User size={18} />} 
                                disabled 
                            />
                        </div>
                        <div className="opacity-60">
                            <Input 
                                label="Email Address (Read Only)" 
                                value={user.email} 
                                icon={<Mail size={18} />} 
                                disabled 
                            />
                        </div>
                        <Input 
                            label="Phone Number" 
                            placeholder="+1 (555) 000-0000" 
                            value={formData.phoneNumber} 
                            onChange={e => setFormData({...formData, phoneNumber: e.target.value})} 
                            icon={<Phone size={18} />} 
                        />
                        <Input 
                            label="Country" 
                            placeholder="e.g. United States" 
                            value={formData.country} 
                            onChange={e => setFormData({...formData, country: e.target.value})} 
                            icon={<Globe size={18} />} 
                        />
                        <div className="md:col-span-2">
                             <Input 
                                label="Residential Address" 
                                placeholder="Street name, suite, city, state" 
                                value={formData.address} 
                                onChange={e => setFormData({...formData, address: e.target.value})} 
                                icon={<MapPin size={18} />} 
                             />
                        </div>
                    </div>

                    {message.text && (
                        <div className={`p-4 rounded-xl text-sm font-bold ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                            {message.text}
                        </div>
                    )}

                    <div className="flex justify-end pt-6">
                        <Button type="submit" isLoading={isSaving} className="px-10 rounded-xl bg-brand-700 shadow-xl shadow-brand-900/10">
                            <Save size={18} className="mr-2" /> Save Changes
                        </Button>
                    </div>
                </form>
            </Card>

            <Card className="p-6 bg-brand-50 dark:bg-brand-900/10 border-brand-100 dark:border-brand-800/50">
                <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-white dark:bg-brand-800 flex items-center justify-center text-brand-600 shadow-sm shrink-0">
                        <User size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-brand-900 dark:text-white">Account Security</h4>
                        <p className="text-xs text-brand-600 dark:text-brand-400 mt-1">
                            Your identity details are used to verify transactions. Keep them up to date to avoid processing delays.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
      </div>
    </div>
  );
};
