'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, MessageCircle, Send, Zap, Activity } from 'lucide-react';

const ContactUsPage = () => {
    useEffect(() => {
        document.title = 'CONTACT US | COMPUTERS';
    }, []);

    const cards = [
        {
            href: 'https://wa.me/923365688821',
            icon: Phone,
            title: 'WhatsApp / Call',
            value: '0336-5688821',
            sub: 'Available on WhatsApp',
        },
        {
            href: 'mailto:kbcomputerz01@gmail.com',
            icon: Mail,
            title: 'Email',
            value: 'kbcomputerz01@gmail.com',
            sub: 'Drop us an email anytime',
        },
        {
            href: 'https://www.google.com/maps/dir/?api=1&destination=33.641411,73.077773',
            icon: MapPin,
            title: 'Location',
            value: 'Umair Centre, Rawalpindi',
            sub: 'Tap to get directions',
        },
        {
            icon: Clock,
            title: 'Hours',
            value: '10AM – 9PM',
            sub: 'Mon – Sat',
        },
    ];

    return (
        <div className="min-h-screen bg-zinc-950 text-slate-200 py-12 md:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background effects removed for performance and build stability */}


            <div className="max-w-3xl md:max-w-7xl mx-auto relative z-10">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center mb-10 md:mb-20"
                >
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 md:hidden bg-primary-500/10 border border-primary-500/20 rounded-full mb-4">
                        <Zap className="w-3 h-3 text-primary-500 fill-current" />
                        <span className="text-[9px] font-black text-primary-500 uppercase tracking-[0.3em]">Get In Touch</span>
                    </span>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black text-white italic tracking-tighter uppercase mb-3 md:mb-6">
                        Establish <span className="text-primary-500 drop-shadow-[0_0_30px_rgba(68,214,44,0.3)]">Contact</span>
                    </h1>
                    <p className="text-[10px] md:text-[11px] font-black text-slate-600 uppercase tracking-[0.4em] md:tracking-[0.6em] max-w-xl mx-auto">
                        Global Operational Support &amp; Inquiries
                    </p>
                </motion.div>

                {/* Info Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-8 md:mb-24">
                    {cards.map((item, idx) => (
                        <motion.a
                            key={idx}
                            href={item.href}
                            target={item.href ? '_blank' : undefined}
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`group p-4 md:p-8 bg-zinc-900/50 backdrop-blur-2xl border border-white/5 rounded-2xl md:rounded-[2.5rem] hover:bg-zinc-900 transition-all ${item.href ? 'cursor-pointer' : 'cursor-default'}`}
                        >
                            <div className="w-9 h-9 md:w-14 md:h-14 bg-zinc-950 border border-white/5 rounded-xl md:rounded-2xl flex items-center justify-center text-primary-500 mb-3 md:mb-8 group-hover:border-primary-500/30 transition-all">
                                <item.icon className="w-4 h-4 md:w-6 md:h-6" />
                            </div>
                            <h3 className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1 md:mb-2">{item.title}</h3>
                            <p className="text-xs md:text-sm font-black text-white italic tracking-tight mb-1 md:mb-2 uppercase leading-tight">{item.value}</p>
                            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-1 md:gap-2">
                                <Activity className="w-2.5 h-2.5 md:w-3 md:h-3 text-primary-500/50 flex-shrink-0" /> {item.sub}
                            </p>
                        </motion.a>
                    ))}
                </div>

                {/* Bottom section */}
                <div className="grid md:grid-cols-12 gap-6 md:gap-10 items-stretch">

                    {/* Feedback Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="md:col-span-12 xl:col-span-7 bg-zinc-900/50 backdrop-blur-2xl p-6 sm:p-8 md:p-14 rounded-3xl md:rounded-[3.5rem] border border-white/5 shadow-2xl"
                    >
                        <h2 className="text-xl md:text-3xl font-black text-white italic uppercase tracking-tighter mb-6 md:mb-10 flex items-center gap-3 md:gap-4">
                            <MessageCircle className="w-5 h-5 md:w-8 md:h-8 text-primary-500" /> Send a Message
                        </h2>
                        <form
                            className="space-y-4 md:space-y-8"
                            onSubmit={(e) => {
                                e.preventDefault();
                                const name = e.target.name.value;
                                const subject = e.target.subject.value;
                                const message = e.target.message.value;
                                const waText = `[KB Inquiry]\n\n*Name:* ${name}\n*Subject:* ${subject}\n\n${message}`;
                                window.open(`https://wa.me/923365688821?text=${encodeURIComponent(waText)}`, '_blank');
                            }}
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
                                <div className="space-y-1.5 md:space-y-2">
                                    <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] px-2 italic">Your Name</label>
                                    <input type="text" name="name" required placeholder="Full name" className="w-full px-4 md:px-6 py-3 md:py-4 bg-zinc-950 border border-white/5 text-white text-xs md:text-sm font-bold rounded-xl md:rounded-2xl focus:border-primary-500 transition-all focus:outline-none placeholder-zinc-700" />
                                </div>
                                <div className="space-y-1.5 md:space-y-2">
                                    <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] px-2 italic">Subject</label>
                                    <input type="text" name="subject" required placeholder="Topic of inquiry" className="w-full px-4 md:px-6 py-3 md:py-4 bg-zinc-950 border border-white/5 text-white text-xs md:text-sm font-bold rounded-xl md:rounded-2xl focus:border-primary-500 transition-all focus:outline-none placeholder-zinc-700" />
                                </div>
                            </div>
                            <div className="space-y-1.5 md:space-y-2">
                                <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] px-2 italic">Message</label>
                                <textarea name="message" rows={4} required placeholder="Your message..." className="w-full px-4 md:px-6 py-3 md:py-4 bg-zinc-950 border border-white/5 text-white text-xs md:text-sm font-bold rounded-xl md:rounded-2xl focus:border-primary-500 transition-all focus:outline-none placeholder-zinc-700 resize-none" />
                            </div>
                            <button type="submit" className="group w-full py-3.5 md:py-5 bg-primary-500 text-zinc-950 font-black uppercase text-[10px] md:text-[11px] tracking-[0.3em] md:tracking-[0.4em] rounded-xl md:rounded-2xl hover:bg-white transition-all shadow-[0_20px_40px_rgba(68,214,44,0.15)] flex items-center justify-center gap-3 md:gap-4">
                                Send via WhatsApp <Send className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </button>
                        </form>
                    </motion.div>

                    {/* WhatsApp CTA */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        className="md:col-span-12 xl:col-span-5"
                    >
                        <div className="bg-primary-500 p-1 rounded-3xl md:rounded-[3rem] shadow-[0_0_50px_rgba(68,214,44,0.1)]">
                            <div className="bg-zinc-950 rounded-[calc(3rem-4px)] md:rounded-[2.8rem] p-6 md:p-10 flex flex-row md:flex-col lg:flex-row items-center justify-between gap-6 md:gap-8">
                                <div className="space-y-2 md:space-y-4">
                                    <div className="px-3 py-1 md:px-4 md:py-1.5 bg-primary-500/10 border border-primary-500/20 rounded-full inline-block">
                                        <p className="text-[9px] md:text-[10px] font-black text-primary-500 uppercase tracking-[0.4em] italic flex items-center gap-1.5 md:gap-2">
                                            <Zap className="w-3 h-3 fill-current" /> Priority Channel
                                        </p>
                                    </div>
                                    <h3 className="text-lg md:text-2xl font-black text-white italic uppercase tracking-tighter">Immediate Support?</h3>
                                    <p className="text-[9px] md:text-[10px] font-bold text-slate-600 uppercase tracking-widest max-w-xs">WhatsApp hotlink active for real-time assistance.</p>
                                </div>
                                <a
                                    href="https://wa.me/923365688821"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-shrink-0 flex items-center gap-2 md:gap-4 px-6 md:px-10 py-3.5 md:py-5 bg-primary-500 text-zinc-950 font-black uppercase text-[10px] md:text-xs tracking-widest rounded-2xl md:rounded-3xl hover:bg-white transition-all shadow-xl whitespace-nowrap group"
                                >
                                    Direct Chat <MessageCircle className="w-4 h-4 md:w-5 md:h-5 group-hover:scale-110 transition-transform" />
                                </a>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ContactUsPage;
