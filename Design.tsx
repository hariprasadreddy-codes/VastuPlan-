import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Phone, Lock, User, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface AuthProps {
  onLogin: (user: any) => void;
}

export default function Auth({ onLogin }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1); // 1: Info, 2: OTP
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    otp: '',
  });

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
    } else {
      // Simulate login
      onLogin({ uid: '123', email: formData.email, phoneNumber: formData.phone, displayName: 'User' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDF5E6] relative overflow-hidden p-4">
      {/* Background with blurry construction image */}
      <div 
        className="fixed inset-0 z-0 opacity-20"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1503387762-592dee58c460?auto=format&fit=crop&q=80&w=1920&blur=10")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-[#D2B48C] overflow-hidden relative z-10"
      >
        <div className="p-10 space-y-8">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-[#8B4513] rounded-2xl mx-auto flex items-center justify-center shadow-xl mb-4">
              <ShieldCheck className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-black text-[#5D4037] tracking-tight">
              {isLogin ? 'Welcome Back' : 'Join VastuPlan AI'}
            </h1>
            <p className="text-[#8B4513] opacity-60 font-medium">
              {isLogin ? 'Sign in to continue planning' : 'Create an account to start designing'}
            </p>
          </div>

          <form onSubmit={handleNext} className="space-y-6">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="info"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  {!isLogin && (
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B4513] opacity-40 group-focus-within:opacity-100 transition-opacity" size={20} />
                      <input
                        type="text"
                        placeholder="Full Name"
                        className="w-full pl-12 pr-4 py-4 bg-[#FFF8DC] rounded-2xl border border-[#D2B48C] focus:ring-2 focus:ring-[#8B4513] outline-none transition-all"
                        required
                      />
                    </div>
                  )}
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B4513] opacity-40 group-focus-within:opacity-100 transition-opacity" size={20} />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 bg-[#FFF8DC] rounded-2xl border border-[#D2B48C] focus:ring-2 focus:ring-[#8B4513] outline-none transition-all"
                      required
                    />
                  </div>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B4513] opacity-40 group-focus-within:opacity-100 transition-opacity" size={20} />
                    <input
                      type="tel"
                      placeholder="Mobile Number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 bg-[#FFF8DC] rounded-2xl border border-[#D2B48C] focus:ring-2 focus:ring-[#8B4513] outline-none transition-all"
                      required
                    />
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B4513] opacity-40 group-focus-within:opacity-100 transition-opacity" size={20} />
                    <input
                      type="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 bg-[#FFF8DC] rounded-2xl border border-[#D2B48C] focus:ring-2 focus:ring-[#8B4513] outline-none transition-all"
                      required
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="otp"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6 text-center"
                >
                  <div className="p-4 bg-[#F5DEB3] rounded-2xl text-[#8B4513] font-bold">
                    We've sent a 6-digit OTP to your mobile and email.
                  </div>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <input
                        key={i}
                        type="text"
                        maxLength={1}
                        className="w-12 h-14 text-center text-2xl font-bold bg-[#FFF8DC] rounded-xl border border-[#D2B48C] focus:ring-2 focus:ring-[#8B4513] outline-none"
                      />
                    ))}
                  </div>
                  <button type="button" onClick={() => setStep(1)} className="text-[#8B4513] font-bold hover:underline">
                    Change details?
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              className="w-full bg-[#8B4513] text-white py-4 rounded-2xl font-bold text-lg shadow-xl hover:bg-[#5D4037] transition-all flex items-center justify-center gap-2 group"
            >
              {step === 1 ? 'Next Step' : (isLogin ? 'Sign In' : 'Create Account')}
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
            </button>
          </form>

          <div className="text-center">
            <button
              onClick={() => { setIsLogin(!isLogin); setStep(1); }}
              className="text-[#8B4513] font-bold hover:text-[#5D4037] transition-colors flex items-center justify-center gap-2 mx-auto"
            >
              <Sparkles size={16} />
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
