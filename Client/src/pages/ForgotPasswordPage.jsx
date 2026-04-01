import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Loader2, ShieldCheck, CheckCircle } from 'lucide-react';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        document.title = 'RESET PASSWORD | COMPUTERS';
    }, []);

    const submitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/api/users/forgot-password', { email });
            setSent(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background glows */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-500/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-600/5 rounded-full blur-[120px]" />
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
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Password Recovery</span>
                    </motion.div>
                    <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-2">
                        Reset <span className="text-primary-500">Access</span>
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">
                        We will email you a reset link
                    </p>
                </div>

                <div className="bg-zinc-900/80 backdrop-blur-2xl border border-white/5 p-8 md:p-10 rounded-[2.5rem] shadow-2xl">
                    {sent ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-6">
                            <div className="w-16 h-16 bg-primary-500/10 border border-primary-500/20 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle className="w-8 h-8 text-primary-500" />
                            </div>
                            <div>
                                <p className="text-white font-black text-sm uppercase tracking-widest mb-2">Email Sent!</p>
                                <p className="text-slate-500 text-xs">
                                    A reset link has been sent to <span className="text-primary-500 font-bold">{email}</span>. Check your inbox.
                                </p>
                            </div>
                            <Link to="/login" className="inline-flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-primary-500 transition-colors">
                                <ArrowLeft className="w-3 h-3" /> Back to Login
                            </Link>
                        </motion.div>
                    ) : (
                        <form onSubmit={submitHandler} className="space-y-6">
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center">
                                    {error}
                                </div>
                            )}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2 flex items-center gap-2">
                                    <Mail className="w-3 h-3" /> Your Gmail Address
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="kbcomputerz01@gmail.com"
                                    className="w-full px-6 py-4 bg-zinc-950 border border-white/5 rounded-2xl text-white text-sm focus:border-primary-500 transition-all placeholder:text-zinc-800 outline-none"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-14 bg-primary-500 text-zinc-950 font-black uppercase tracking-[0.3em] rounded-2xl transition-all hover:bg-white flex items-center justify-center gap-3 text-xs disabled:opacity-50 mt-4"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Reset Link'}
                            </button>
                            <div className="text-center">
                                <Link to="/login" className="inline-flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-primary-500 transition-colors">
                                    <ArrowLeft className="w-3 h-3" /> Back to Login
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPasswordPage;
