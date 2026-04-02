'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Mail, Lock, Loader2, Key, ArrowRight, Fingerprint, Activity } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { motion } from 'framer-motion';
import useAuthStore from '@/store/authStore';
import toast from 'react-hot-toast';

const LoginContent = () => {
    const { login, googleLogin, isLoading, error } = useAuthStore();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') || '/';

    const loginWithGoogle = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            if (!window.google) {
                toast.error("Google authentication script is currently unavailable (DNS Error). Please use email/password.");
                return;
            }
            try {
                const data = await googleLogin(tokenResponse.access_token);
                if (data?.isAdmin) {
                    router.push('/admin');
                } else {
                    router.push(redirect);
                }
            } catch (err) {
                console.error("Google Auth failed", err);
            }
        },
        onError: errorResponse => console.error("Google Login Error:", errorResponse),
        scope: 'openid email profile',
    });

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        document.title = "AUTHENTICATION REQUIRED | KB SECURE";
    }, []);

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            const data = await login(email, password);
            if (data?.isAdmin) {
                router.push('/admin');
            } else {
                router.push(redirect);
            }
        } catch (err) { }
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-500/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-600/5 rounded-full blur-[120px]"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.02] pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full relative z-10"
            >
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-white/5 rounded-full mb-6"
                    >
                        <ShieldCheck className="w-4 h-4 text-primary-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Secure Environment</span>
                    </motion.div>

                    <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-2">
                        System <span className="text-primary-500">Access</span>
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">Enter Identification Protocol</p>
                </div>

                <div className="bg-zinc-900/80 backdrop-blur-2xl border border-white/5 p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative">
                    <div className="absolute top-0 right-10 -translate-y-1/2">
                        <div className="w-16 h-16 bg-zinc-950 border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl">
                            <Fingerprint className="w-8 h-8 text-primary-500/50" />
                        </div>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest mb-8 text-center"
                        >
                            Log Failure: {error}
                        </motion.div>
                    )}

                    <form onSubmit={submitHandler} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2 flex items-center gap-2">
                                <Mail className="w-3 h-3" /> Email
                            </label>
                            <input
                                type="email"
                                required
                                autoComplete="new-password"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-6 py-4 bg-zinc-950 border border-white/5 rounded-2xl text-white text-sm focus:border-primary-500 transition-all placeholder:text-zinc-800"
                                placeholder="Enter your email"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2 flex items-center gap-2">
                                <Lock className="w-3 h-3" /> Password
                            </label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-6 py-4 bg-zinc-950 border border-white/5 rounded-2xl text-white text-sm focus:border-primary-500 transition-all placeholder:text-zinc-800"
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="text-right -mt-2">
                            <Link href="/forgot-password" className="text-[9px] font-black text-slate-600 uppercase tracking-widest hover:text-primary-500 transition-colors">
                                Forgot Password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full group h-16 bg-primary-500 text-zinc-950 font-black uppercase tracking-[0.3em] rounded-2xl transition-all hover:bg-white flex items-center justify-center gap-4 text-xs disabled:opacity-50 mt-10"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>Verify Identity <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-10">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-[1px] flex-1 bg-white/5"></div>
                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Global Auth</span>
                            <div className="h-[1px] flex-1 bg-white/5"></div>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                if (!window.google) {
                                    toast.error("Authentication Service (Google) is unreachable. Check your connection or use email.");
                                    return;
                                }
                                loginWithGoogle();
                            }}
                            disabled={isLoading}
                            className="w-full h-14 bg-zinc-950 border border-white/5 text-slate-400 font-bold text-xs rounded-2xl hover:bg-zinc-800 hover:text-white transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor" opacity="0.5" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="currentColor" opacity="0.3" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 8.81 1 5.76 2.18 3.47 4.23L7.07 7h3.66c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor" opacity="0.5" />
                            </svg>
                            Continue via Google Sync
                        </button>
                    </div>
                </div>

                <div className="mt-10 flex items-center justify-between px-6">
                    <div className="flex items-center gap-2">
                        <Activity className="w-3 h-3 text-primary-500 animate-pulse" />
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Core Encryption: 256-BIT</span>
                    </div>
                    <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest">v2.4.0-SECURE</div>
                </div>
            </motion.div>
        </div>
    );
};

export default function LoginPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoginContent />
        </Suspense>
    );
}
