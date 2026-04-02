'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api/axios';
import useAuthStore from '@/store/authStore';
import useCartStore from '@/store/cartStore';
import toast from 'react-hot-toast';
import { ShieldCheck, Truck, CreditCard, User, Mail, Smartphone, MapPin, Package, LockKeyhole, Loader2, ChevronRight, Zap, Target, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CheckoutPage = () => {
    const { userInfo } = useAuthStore();
    const { cartItems, clearCart } = useCartStore();
    const router = useRouter();

    const [name, setName] = useState(userInfo?.name || '');
    const [email, setEmail] = useState(userInfo?.email || '');

    const [shippingAddress, setShippingAddress] = useState({
        address: userInfo?.address?.street || '',
        city: userInfo?.address?.city || '',
        country: userInfo?.address?.country || 'Pakistan',
        phone: userInfo?.phone || ''
    });

    const [paymentMethod, setPaymentMethod] = useState('Direct');
    const [mobileAccount, setMobileAccount] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        document.title = "CHECKOUT | COMPUTERS";
        if (typeof window !== 'undefined') window.scrollTo(0, 0);
        if (cartItems.length === 0) {
            router.push('/cart');
        }
    }, [cartItems, router]);

    const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
    const totalPrice = itemsPrice;
    const [phoneError, setPhoneError] = useState('');

    const validatePakistaniPhone = (phone) => {
        const cleaned = phone.replace(/-/g, '');
        return /^03[0-9]{9}$/.test(cleaned);
    };

    const placeOrderHandler = async (e) => {
        e.preventDefault();

        if (!name.trim() || !email.trim()) {
            toast.error('Registration Error: All fields required'); return;
        }

        if (!validatePakistaniPhone(shippingAddress.phone)) {
            setPhoneError('Enter a valid Pakistani number (e.g. 03XX-XXXXXXX)');
            return;
        } else {
            setPhoneError('');
        }

        if ((paymentMethod === 'Easypaisa') && !mobileAccount) {
            toast.error(`Validation Error: Mobile account for ${paymentMethod} required`); return;
        }

        try {
            setLoading(true);
            
            const { data } = await api.post('/api/orders', {
                orderItems: cartItems.map(item => ({
                    name: item.name,
                    qty: item.qty,
                    image: item.image || '',
                    price: item.price,
                    product: item.product
                })),
                shippingAddress,
                paymentMethod,
                itemsPrice,
                customerName: name,
                customerEmail: email
            });

            if (paymentMethod === 'Direct') {
                toast.success('Success: Order placed. You will be contacted shortly.');
                clearCart();
                router.push(`/success/${data._id}`);
            } else if (paymentMethod === 'Easypaisa') {
                await api.post(`/api/payment/${paymentMethod.toLowerCase()}/init`, {
                    amount: totalPrice,
                    accountNumber: mobileAccount
                });
                toast.success('Payment Initialized: Check your mobile app.');
                clearCart();
                router.push(`/success/${data._id}`);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error: Order could not be placed');
        } finally {
            setLoading(false);
        }
    };

    if (cartItems.length === 0) return null;

    return (
        <div className="min-h-screen bg-zinc-950 text-slate-200 pb-32">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
                <h1 className="text-2xl sm:text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter leading-none mb-8 sm:mb-16 flex items-center gap-3 sm:gap-6">
                    <div className="w-8 h-8 sm:w-12 sm:h-12 bg-primary-500 rounded-lg sm:rounded-2xl flex items-center justify-center text-zinc-950 shadow-[0_0_20px_rgba(68,214,44,0.5)]">
                        <LockKeyhole className="w-4 h-4 sm:w-6 sm:h-6" />
                    </div>
                    Secure <span className="text-zinc-800 tracking-[-0.1em]">Checkout</span>
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 relative z-10">
                    <div className="lg:col-span-8 space-y-10">
                        <form id="checkout-form" onSubmit={placeOrderHandler} className="space-y-10">
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-zinc-900 p-6 sm:p-8 md:p-10 rounded-[1.5rem] sm:rounded-[2.5rem] border border-white/5 relative overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 to-primary-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                                <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-8 flex items-center gap-4">
                                    Customer Information <div className="h-[1px] flex-1 bg-zinc-800"></div>
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest px-2">Full Name</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-800 group-focus-within:text-primary-500 transition-colors" />
                                            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Legal Name" className="w-full pl-12 pr-4 h-12 sm:h-14 bg-zinc-950 border border-white/5 rounded-2xl text-white focus:ring-1 focus:ring-primary-500/30 focus:border-primary-500 transition-all placeholder-zinc-800 text-xs sm:text-sm font-medium" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest px-2">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-800 group-focus-within:text-primary-500 transition-colors" />
                                            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="kbcomputerz01@gmail.com" className="w-full pl-12 pr-4 h-11 sm:h-14 bg-zinc-950 border border-white/5 rounded-2xl text-white focus:ring-1 focus:ring-primary-500/30 focus:border-primary-500 transition-all placeholder-zinc-800 text-xs sm:text-sm font-medium" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-zinc-900 p-6 sm:p-8 md:p-10 rounded-[1.5rem] sm:rounded-[2.5rem] border border-white/5 relative overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 to-primary-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                                <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-8 flex items-center gap-4">
                                    Shipping Details <div className="h-[1px] flex-1 bg-zinc-800"></div>
                                </h2>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest px-2">Deployment Address</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-800 group-focus-within:text-primary-500 transition-colors" />
                                            <input type="text" required value={shippingAddress.address} onChange={(e) => setShippingAddress({...shippingAddress, address: e.target.value})} placeholder="Industrial Sector, Zone, Coordinates" className="w-full pl-12 pr-4 h-12 sm:h-14 bg-zinc-950 border border-white/5 rounded-2xl text-white focus:ring-1 focus:ring-primary-500/30 focus:border-primary-500 transition-all placeholder-zinc-800 text-xs sm:text-sm font-medium" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest px-2">City</label>
                                            <input type="text" required value={shippingAddress.city} onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})} placeholder="City" className="w-full px-4 sm:px-6 h-11 sm:h-14 bg-zinc-950 border border-white/5 rounded-2xl text-white focus:ring-1 focus:ring-primary-500/30 transition-all placeholder-zinc-800 text-xs sm:text-sm font-medium" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest px-2">Country</label>
                                            <input type="text" required value={shippingAddress.country} onChange={(e) => setShippingAddress({...shippingAddress, country: e.target.value})} className="w-full px-6 h-11 sm:h-14 bg-zinc-950 border border-white/5 rounded-2xl text-white focus:ring-0 text-sm font-black opacity-50 cursor-not-allowed uppercase italic tracking-widest" readOnly />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest px-2">WhatsApp Number</label>
                                        <div className="relative">
                                            <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-800 group-focus-within:text-primary-500 transition-colors" />
                                            <input
                                                type="text"
                                                required
                                                value={shippingAddress.phone}
                                                onChange={(e) => {
                                                    setShippingAddress({...shippingAddress, phone: e.target.value});
                                                    if (phoneError) setPhoneError('');
                                                }}
                                                placeholder="03XX-XXXXXXX (WhatsApp)"
                                                maxLength={12}
                                                className={`w-full pl-12 pr-4 h-11 sm:h-14 bg-zinc-950 border rounded-2xl text-white focus:ring-1 transition-all placeholder-zinc-800 text-sm font-medium outline-none ${
                                                    phoneError ? 'border-red-500 focus:ring-red-500/30' : 'border-white/5 focus:ring-primary-500/30 focus:border-primary-500'
                                                }`}
                                            />
                                        </div>
                                        {phoneError && (
                                            <p className="text-[9px] font-black text-red-500 uppercase tracking-widest px-2 mt-1">{phoneError}</p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </form>
                    </div>

                    <div className="lg:col-span-4">
                        <div className="bg-zinc-900 p-6 sm:p-8 md:p-10 rounded-[2rem] sm:rounded-[3rem] border border-white/5 shadow-2xl sticky top-32 space-y-8 sm:space-y-10">
                            <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">Order <br /><span className="text-zinc-800">Summary</span></h2>

                            <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                                {cartItems.map(item => (
                                    <div key={item.product} className="flex items-center gap-4 p-4 bg-zinc-950 border border-white/5 rounded-2xl group transition-all hover:border-primary-500/20">
                                        <div className="w-14 h-14 bg-zinc-900 rounded-xl overflow-hidden flex items-center justify-center border border-white/5 group-hover:scale-105 transition-transform">
                                            <img src={item.image} alt="" className="w-full h-full object-contain mix-blend-lighten p-1" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] font-black text-white uppercase tracking-tight truncate italic">{item.name}</p>
                                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-0.5">ALLOC: {item.qty} UNITS</p>
                                        </div>
                                        <p className="text-xs font-black text-white italic">PKR {(item.price * item.qty).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4 border-t border-white/5 pt-8">
                                <div className="flex justify-between items-center text-slate-500">
                                    <span className="text-[10px] font-black uppercase tracking-widest">Subtotal</span>
                                    <span className="font-bold text-white text-sm">PKR {itemsPrice.toLocaleString()}</span>
                                </div>

                                <div className="pt-8 border-t border-white/5 flex flex-col gap-2">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[9px] sm:text-[10px] font-black text-white uppercase tracking-widest">Total Amount</span>
                                        <span className="text-2xl sm:text-4xl font-black text-white italic tracking-tighter">PKR {totalPrice.toLocaleString()}</span>
                                    </div>
                                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest text-right">Secure Checkout Final</p>
                                </div>
                            </div>

                            <button 
                                type="submit"
                                form="checkout-form"
                                disabled={loading || cartItems.length === 0}
                                className="w-full relative h-16 sm:h-20 bg-primary-500 text-zinc-950 font-black uppercase tracking-[0.3em] overflow-hidden rounded-2xl sm:rounded-[1.5rem] transition-all hover:bg-white shadow-[0_20px_40px_rgba(68,214,44,0.2)] flex items-center justify-center gap-3 text-[10px] sm:text-xs disabled:opacity-30 disabled:hover:bg-primary-500"
                            >
                                {loading ? (
                                    <><Loader2 className="w-5 h-5 animate-spin" /> Placing Order...</>
                                ) : (
                                    <><ShieldCheck className="w-5 h-5" /> Place Order</>
                                )}
                            </button>

                            <div className="flex items-center justify-center gap-4 opacity-30">
                                <LockKeyhole className="w-3 h-3" />
                                <span className="text-[8px] font-black uppercase tracking-[0.4em]">SSL Level 5 Encrypted</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
