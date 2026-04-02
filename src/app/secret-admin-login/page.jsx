'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Key } from 'lucide-react';
import useAuthStore from '@/store/authStore';

const SecretAdminLoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, isLoading, error } = useAuthStore();
    const router = useRouter();

    const submitHandler = async (e) => {
        e.preventDefault();
        const data = await login(email, password);
        if (data?.isAdmin) {
            router.push('/admin');
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-slate-800 rounded-3xl p-8 shadow-2xl border border-slate-700">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                        <Lock className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white tracking-widest uppercase">Admin Terminal</h2>
                    <p className="text-slate-400 mt-2 text-sm font-mono">Restricted Access Module</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 text-red-500 p-4 rounded-xl text-sm font-mono mb-6 border border-red-500/20 text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={submitHandler} className="space-y-6">
                    <div>
                        <div className="relative">
                            <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-red-500 text-white font-mono placeholder-slate-600 outline-none transition-all"
                                placeholder="Admin Email"
                            />
                        </div>
                    </div>
                    <div>
                        <div className="relative">
                            <Key className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-red-500 text-white font-mono placeholder-slate-600 outline-none transition-all"
                                placeholder="Admin Password"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 py-4 font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 transition shadow-lg shadow-red-900/50 uppercase tracking-widest font-mono text-sm"
                    >
                        {isLoading ? 'Authenticating...' : 'Authorize Access'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SecretAdminLoginPage;
