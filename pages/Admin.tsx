import React, { useEffect, useState } from 'react';
import { useGlobal } from '../context/GlobalState';
import { Card, Button, StatusBadge } from '../components/UIComponents';
import { Users, DollarSign, Activity, Ban, Loader2 } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { User } from '../types';

export const Admin = () => {
  const { user } = useGlobal();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
        if (user?.role !== 'admin') return;
        try {
            const q = query(collection(db, 'users'), orderBy('name'), limit(50));
            const snapshot = await getDocs(q);
            const userList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
            setUsers(userList);
        } catch (e) {
            console.error("Failed to fetch users", e);
        } finally {
            setIsLoading(false);
        }
    };
    fetchUsers();
  }, [user]);

  if (user?.role !== 'admin') {
      return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="space-y-8 animate-fade-in">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Overview</h1>

        {/* High Level Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
                { label: 'Total Users', value: users.length.toString(), icon: <Users size={20} />, color: 'blue' },
                { label: 'Total Volume', value: '$4.2M', icon: <Activity size={20} />, color: 'purple' },
                { label: 'Commission Earned', value: '$125K', icon: <DollarSign size={20} />, color: 'emerald' },
                { label: 'Active Disputes', value: '3', icon: <Ban size={20} />, color: 'red' },
            ].map((stat, i) => (
                <Card key={i} className="p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">{stat.label}</p>
                            <h3 className="text-2xl font-bold mt-1 dark:text-white">{stat.value}</h3>
                        </div>
                        <div className={`p-3 rounded-lg bg-${stat.color}-100 text-${stat.color}-600 dark:bg-${stat.color}-900/30`}>
                            {stat.icon}
                        </div>
                    </div>
                </Card>
            ))}
        </div>

        {/* User Management Table */}
        <Card className="overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">User Management</h3>
                <div className="flex gap-2">
                    <Button variant="outline" className="text-xs">Export CSV</Button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 uppercase">
                        <tr>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Account No.</th>
                            <th className="px-6 py-4">Balance</th>
                            <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                    <Loader2 className="animate-spin w-6 h-6 mx-auto mb-2" />
                                    Loading users...
                                </td>
                            </tr>
                        ) : users.length > 0 ? (
                            users.map((u) => (
                                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                                                <img src={u.avatarUrl} alt="" className="w-full h-full object-cover"/>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">{u.name}</p>
                                                <p className="text-xs text-gray-500">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={u.kycStatus === 'verified' ? 'verified' : 'pending'} />
                                    </td>
                                    <td className="px-6 py-4 font-mono text-gray-600 dark:text-gray-400">
                                        {u.accountNumber}
                                    </td>
                                    <td className="px-6 py-4 dark:text-gray-300 font-medium">
                                        ${u.balance.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-gray-400 hover:text-brand-600 mr-3 transition-colors">Edit</button>
                                        <button className="text-red-400 hover:text-red-600 transition-colors">Suspend</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                    No users found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    </div>
  );
};