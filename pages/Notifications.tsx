import React from 'react';
import { useGlobal } from '../context/GlobalState';
import { Card, Button, StatusBadge } from '../components/UIComponents';
import { 
    Bell, 
    CheckCircle2, 
    XCircle, 
    Info, 
    AlertTriangle,
    Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Notifications = () => {
  const { notifications, loading } = useGlobal();
  const navigate = useNavigate();

  const getIcon = (type: string) => {
      switch(type) {
          case 'success': return <CheckCircle2 className="text-green-500" size={24} />;
          case 'error': return <XCircle className="text-red-500" size={24} />;
          case 'warning': return <AlertTriangle className="text-orange-500" size={24} />;
          default: return <Info className="text-blue-500" size={24} />;
      }
  };

  const getBgColor = (type: string) => {
    switch(type) {
        case 'success': return 'bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900/30';
        case 'error': return 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30';
        case 'warning': return 'bg-orange-50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-900/30';
        default: return 'bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30';
    }
  };

  if (loading) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Bell className="text-brand-600" /> Notifications
            </h1>
            <Button variant="ghost" size="sm">Mark all as read</Button>
        </div>

        {notifications.length > 0 ? (
            <div className="space-y-4">
                {notifications.map((notif) => (
                    <div 
                        key={notif.id}
                        className={`p-4 rounded-xl border flex gap-4 transition-all duration-300 hover:shadow-md ${getBgColor(notif.type)}`}
                    >
                        <div className="shrink-0 mt-1">
                            {getIcon(notif.type)}
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-gray-900 dark:text-white">{notif.title}</h3>
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <Clock size={12} />
                                    {new Date(notif.date).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{notif.message}</p>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <Card className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                    <Bell size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">No notifications</h3>
                <p className="text-gray-500">You're all caught up! Recent activity will appear here.</p>
                <Button className="mt-6" onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
            </Card>
        )}
    </div>
  );
};