import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, User, Loader2, ArrowRight, Fingerprint, Activity, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import useAuthStore from '../store/authStore';

const RegisterPage = () => {
    const { register, isLoading, error } = useAuthStore();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirect = searchParams.get('redirect') || '/';
    
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [validationError, setValidationError] = useState('');

    useEffect(() => {
        document.title = "IDENTITY REGISTRATION | KB SECURE";
    }, []);

    const submitHandler = async (e) => {
        e.preventDefault();
        setValidationError('');
        if (password !== confirmPassword) {
            setValidationError('Passwords do not match');
            return;
        }
        try {
            await register(name, email, password);
            navigate(redirect);
        } catch (err) { }
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Ambient Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-500/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-600/5 rounded-full blur-[120px]"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.02] pointer-events-none" 
                     style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full relative z-10"
            >
                {/* Brand Header */}
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-white/5 rounded-full mb-6"
                    >
                        <ShieldCheck className="w-4 h-4 text-primary-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Initialize Identity</span>
                    </motion.div>
                    
                    <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-2">
                        Create <span className="text-primary-500">Registry</span>
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">Enter Identification Parameters</p>
                </div>

                {/* Register Container */}
                <div className="bg-zinc-900/80 backdrop-blur-2xl border border-white/5 p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative">
                    <div className="absolute top-0 right-10 -translate-y-1/2">
                        <div className="w-16 h-16 bg-zinc-950 border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl">
                            <Fingerprint className="w-8 h-8 text-primary-500/50" />
                        </div>
                    </div>

                    {(error || validationError) && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest mb-8 text-center flex items-center justify-center gap-3"
                        >
                            <ShieldAlert className="w-4 h-4" />
                            Registry Error: {validationError || error}
                        </motion.div>
                    )}

                    <form onSubmit={submitHandler} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2 flex items-center gap-2">
                                <User className="w-3 h-3" /> Full Name / Codename
                            </label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-6 py-4 bg-zinc-950 border border-white/5 rounded-2xl text-white text-sm focus:border-primary-500 transition-all placeholder:text-zinc-800"
                                placeholder="Agent Identity"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2 flex items-center gap-2">
                                <Mail className="w-3 h-3" /> Electronic Mail
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-6 py-4 bg-zinc-950 border border-white/5 rounded-2xl text-white text-sm focus:border-primary-500 transition-all placeholder:text-zinc-800"
                                placeholder="kbcomputerz01@gmail.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2 flex items-center gap-2">
                                <Lock className="w-3 h-3" /> Security Token
                            </label>
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-6 py-4 bg-zinc-950 border border-white/5 rounded-2xl text-white text-sm focus:border-primary-500 transition-all placeholder:text-zinc-800"
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2 flex items-center gap-2">
                                <ShieldCheck className="w-3 h-3" /> Confirm Token
                            </label>
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-6 py-4 bg-zinc-950 border border-white/5 rounded-2xl text-white text-sm focus:border-primary-500 transition-all placeholder:text-zinc-800"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full group h-16 bg-primary-500 text-zinc-950 font-black uppercase tracking-[0.3em] rounded-2xl transition-all hover:bg-white flex items-center justify-center gap-4 text-xs disabled:opacity-50 mt-10"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>Deploy Identity <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 text-center">
                        <Link 
                            to={redirect ? `/login?redirect=${redirect}` : '/login'}
                            className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-primary-500 transition-colors flex items-center justify-center gap-2"
                        >
                            Existing Personnel? <span className="text-white border-b border-white/10 pb-0.5">Authenticate</span>
                        </Link>
                    </div>
                </div>

                {/* Footer Security status */}
                <div className="mt-10 flex items-center justify-between px-6">
                    <div className="flex items-center gap-2">
                        <Activity className="w-3 h-3 text-primary-500 animate-pulse" />
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Protocol: RSA-4096</span>
                    </div>
                    <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest">v2.4.0-SECURE</div>
                </div>
            </motion.div>
        </div>
    );
};

export default RegisterPage;

