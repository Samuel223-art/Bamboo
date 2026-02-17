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
          setMessage({ text: '¡Perfil actualizado!', type: 'success' });
      } catch (err) {
          setMessage({ text: 'Error al actualizar.', type: 'error' });
      } finally {
          setIsSaving(false);
      }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-brand-900 dark:text-white tracking-tight">Perfil</h1>
          <p className="text-xs text-brand-600 dark:text-brand-400 font-bold uppercase tracking-wider">Identidad de la Cuenta</p>
        </div>
        <Button variant="outline" size="sm" className="border-red-100 text-red-500 hover:bg-red-50" onClick={logout}>
          <LogOut size={14} className="mr-1.5" /> Cerrar Sesión
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Avatar and Status */}
        <div className="space-y-4">
            <Card className="p-6 flex flex-col items-center text-center shadow-md border-brand-50">
                <div className="relative group mb-4">
                    <div className="w-28 h-28 rounded-full border-4 border-brand-50 dark:border-brand-900/50 bg-brand-100 overflow-hidden shadow-inner">
                        <img src={user.avatarUrl} alt="Perfil" className="w-full h-full object-cover" />
                    </div>
                    <button className="absolute bottom-1 right-1 p-2 bg-brand-600 text-white rounded-full shadow-lg hover:bg-brand-700 transition-all active:scale-90">
                        <Camera size={16} />
                    </button>
                </div>
                <h2 className="text-lg font-bold text-brand-900 dark:text-white">{user.name}</h2>
                <p className="text-xs text-brand-500 dark:text-brand-400 mb-4">{user.email}</p>
                <div className="flex flex-col gap-2 w-full">
                    <div className="flex items-center justify-between p-2.5 bg-brand-50 dark:bg-brand-900/20 rounded-lg border border-brand-100 dark:border-brand-800">
                        <span className="text-[9px] font-black uppercase text-brand-400">Estado KYC</span>
                        <StatusBadge status={user.kycStatus} />
                    </div>
                </div>
            </Card>
        </div>

        {/* Right column: Form */}
        <div className="lg:col-span-2 space-y-4">
            <Card className="p-6 shadow-md border-brand-50">
                <h3 className="text-sm font-black text-brand-900 dark:text-white mb-6 uppercase tracking-widest border-b border-brand-50 dark:border-brand-800 pb-2">Información</h3>
                
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="opacity-60">
                            <Input 
                                label="Nombre" 
                                value={user.name} 
                                icon={<User size={14} />} 
                                disabled 
                            />
                        </div>
                        <div className="opacity-60">
                            <Input 
                                label="Correo" 
                                value={user.email} 
                                icon={<Mail size={14} />} 
                                disabled 
                            />
                        </div>
                        <Input 
                            label="Teléfono" 
                            placeholder="+1 (555) 000-0000" 
                            value={formData.phoneNumber} 
                            onChange={e => setFormData({...formData, phoneNumber: e.target.value})} 
                            icon={<Phone size={14} />} 
                        />
                        <Input 
                            label="País" 
                            placeholder="ej. España" 
                            value={formData.country} 
                            onChange={e => setFormData({...formData, country: e.target.value})} 
                            icon={<Globe size={14} />} 
                        />
                        <div className="md:col-span-2">
                             <Input 
                                label="Dirección" 
                                placeholder="Ciudad, Estado, CP" 
                                value={formData.address} 
                                onChange={e => setFormData({...formData, address: e.target.value})} 
                                icon={<MapPin size={14} />} 
                             />
                        </div>
                    </div>

                    {message.text && (
                        <div className={`p-3 rounded-lg text-xs font-bold ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                            {message.text}
                        </div>
                    )}

                    <div className="flex justify-end pt-2">
                        <Button type="submit" size="sm" isLoading={isSaving} className="px-8 rounded-lg bg-brand-700">
                            Guardar Perfil
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
      </div>
    </div>
  );
};
