import React, { useState } from 'react';
import { useGlobal } from '../context/GlobalState';
import { Card, Button, Toggle, Select, Input } from '../components/UIComponents';
import { 
    Shield, 
    Bell, 
    Lock, 
    Globe, 
    Smartphone, 
    Monitor,
    Key,
    Check
} from 'lucide-react';

type SettingsTab = 'general' | 'security' | 'notifications';

export const Settings = () => {
    const { user, updateTransactionPin, changeUserPassword } = useGlobal();
    const [activeTab, setActiveTab] = useState<SettingsTab>('general');
    
    // Settings State
    const [emailNotif, setEmailNotif] = useState(true);
    const [pushNotif, setPushNotif] = useState(true);
    const [marketing, setMarketing] = useState(false);
    const [twoFactor, setTwoFactor] = useState(true);
    const [tradingMode, setTradingMode] = useState(true);
    const [currency, setCurrency] = useState('USD');
    const [language, setLanguage] = useState('es');

    // Forms State
    const [pin, setPin] = useState('');
    const [pinLoading, setPinLoading] = useState(false);
    const [pinMessage, setPinMessage] = useState('');

    const [passData, setPassData] = useState({ new: '', confirm: '' });
    const [passLoading, setPassLoading] = useState(false);
    const [passMessage, setPassMessage] = useState('');

    if (!user) return null;

    const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
        { id: 'general', label: 'General', icon: <Globe size={16} /> },
        { id: 'security', label: 'Seguridad', icon: <Shield size={16} /> },
        { id: 'notifications', label: 'Notificaciones', icon: <Bell size={16} /> },
    ];

    const handlePinUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setPinLoading(true);
        setPinMessage('');
        try {
            if (pin.length < 4) throw new Error("El PIN debe tener 4 dígitos");
            await updateTransactionPin(pin);
            setPinMessage("PIN de transacción actualizado con éxito.");
            setPin('');
        } catch (e: any) {
            setPinMessage(e.message || "Error al actualizar el PIN");
        } finally {
            setPinLoading(false);
        }
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setPassLoading(true);
        setPassMessage('');
        try {
            if (passData.new.length < 6) throw new Error("Contraseña demasiado corta");
            if (passData.new !== passData.confirm) throw new Error("Las contraseñas no coinciden");
            await changeUserPassword(passData.new);
            setPassMessage("Contraseña cambiada con éxito.");
            setPassData({ new: '', confirm: '' });
        } catch (e: any) {
            setPassMessage(e.message || "Error al cambiar contraseña (requiere inicio reciente)");
        } finally {
            setPassLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-4 animate-fade-in">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Ajustes</h1>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* Navigation Tabs */}
                <Card className="h-fit p-1.5 lg:col-span-1">
                    <div className="flex lg:flex-col gap-1 overflow-x-auto">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap
                                    ${activeTab === tab.id 
                                        ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400' 
                                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}
                                `}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </Card>

                {/* Content Area */}
                <Card className="p-4 lg:p-6 lg:col-span-3 min-h-[400px]">
                    {activeTab === 'general' && (
                        <div className="space-y-6 animate-fade-in">
                            <div>
                                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-3">Preferencias</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Select 
                                        label="Idioma del Sistema"
                                        options={[
                                            { value: 'en', label: 'English (US)' },
                                            { value: 'es', label: 'Español' },
                                            { value: 'fr', label: 'Français' },
                                        ]}
                                        value={language}
                                        onChange={setLanguage}
                                    />
                                    <Select 
                                        label="Moneda Predeterminada"
                                        options={[
                                            { value: 'USD', label: 'USD - Dólar EE.UU.' },
                                            { value: 'EUR', label: 'EUR - Euro' },
                                        ]}
                                        value={currency}
                                        onChange={setCurrency}
                                    />
                                </div>
                            </div>
                            
                            <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-3">Interfaz de Trading</h2>
                                <Toggle 
                                    label="Modo Trading Pro" 
                                    description="Habilita herramientas de gráficos avanzadas."
                                    checked={tradingMode}
                                    onChange={setTradingMode}
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="space-y-6 animate-fade-in">
                            <div>
                                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">Inicio y Seguridad</h2>
                                
                                {/* Transaction PIN */}
                                <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1.5 flex items-center gap-2">
                                        <Key size={14} className="text-brand-600" /> PIN de Transacción
                                    </h3>
                                    <p className="text-[10px] text-gray-500 mb-3">Obligatorio para transacciones sensibles.</p>
                                    <form onSubmit={handlePinUpdate} className="flex flex-col sm:flex-row gap-2 items-end">
                                        <Input 
                                            type="password" 
                                            placeholder="PIN de 4 dígitos" 
                                            maxLength={4} 
                                            className="w-full sm:w-32 text-center tracking-widest"
                                            value={pin}
                                            onChange={(e) => setPin(e.target.value)}
                                        />
                                        <Button type="submit" size="sm" isLoading={pinLoading} disabled={!pin}>
                                            {user.transactionPin ? 'Actualizar PIN' : 'Configurar PIN'}
                                        </Button>
                                    </form>
                                    {pinMessage && <p className="mt-1.5 text-[10px] font-bold text-brand-600 dark:text-brand-400">{pinMessage}</p>}
                                </div>

                                {/* Change Password */}
                                <div className="mb-4 p-4 border border-gray-100 dark:border-gray-800 rounded-xl">
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                        <Lock size={14} className="text-brand-600" /> Cambiar Contraseña
                                    </h3>
                                    <form onSubmit={handlePasswordUpdate} className="space-y-3">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <Input 
                                                type="password" 
                                                label="Nueva Contraseña" 
                                                value={passData.new}
                                                onChange={(e) => setPassData({...passData, new: e.target.value})}
                                            />
                                            <Input 
                                                type="password" 
                                                label="Confirmar Contraseña" 
                                                value={passData.confirm}
                                                onChange={(e) => setPassData({...passData, confirm: e.target.value})}
                                            />
                                        </div>
                                        <Button type="submit" size="sm" variant="outline" isLoading={passLoading} disabled={!passData.new}>Actualizar Contraseña</Button>
                                    </form>
                                    {passMessage && <p className="mt-1.5 text-[10px] font-bold text-brand-600 dark:text-brand-400">{passMessage}</p>}
                                </div>
                                
                                <div className="border border-gray-100 dark:border-gray-800 rounded-lg p-3">
                                    <Toggle 
                                        label="Autenticación de Dos Factores (2FA)" 
                                        description="Capa extra de protección para tu cuenta."
                                        checked={twoFactor}
                                        onChange={setTwoFactor}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                         <div className="space-y-4 animate-fade-in">
                            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">Preferencias de Notificación</h2>
                            <div className="space-y-3 divide-y divide-gray-100 dark:divide-gray-800">
                                <Toggle 
                                    label="Notificaciones por Email" 
                                    description="Resumen de transacciones vía email."
                                    checked={emailNotif} 
                                    onChange={setEmailNotif} 
                                />
                                <Toggle 
                                    label="Notificaciones Push" 
                                    description="Alertas instantáneas de fondos."
                                    checked={pushNotif} 
                                    onChange={setPushNotif} 
                                />
                                <Toggle 
                                    label="Noticias y Marketing" 
                                    description="Mantente al día con nuevas funciones."
                                    checked={marketing} 
                                    onChange={setMarketing} 
                                />
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};
