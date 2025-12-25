
import React from 'react';
import { useAuth } from '../App';
import { Shield, Smartphone, Globe, ArrowRight } from 'lucide-react';

const Login: React.FC = () => {
  const { login } = useAuth();

  return (
    <div className="h-screen bg-indigo-600 text-white flex flex-col p-8 overflow-hidden">
      <div className="flex-1 flex flex-col justify-center">
        <div className="bg-white/10 p-4 rounded-3xl inline-block mb-8 self-start border border-white/20">
          <Shield size={40} className="text-white" />
        </div>
        <h1 className="text-5xl font-black tracking-tight leading-tight">
          PayFast<br/><span className="text-indigo-200">Instant UPI</span>
        </h1>
        <p className="mt-4 text-indigo-100 text-lg leading-relaxed max-w-[280px]">
          Seamless, secure, and lightning fast payments for everyone.
        </p>

        <div className="mt-12 space-y-4">
          <div className="flex items-center gap-4 text-sm text-indigo-200 bg-white/5 p-4 rounded-2xl">
            <Smartphone size={20} />
            <span>Link any bank account in seconds</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-indigo-200 bg-white/5 p-4 rounded-2xl">
            <Globe size={20} />
            <span>Pay anyone, anywhere instantly</span>
          </div>
        </div>
      </div>

      <div className="pb-8 space-y-6">
        <div className="bg-white rounded-[2.5rem] p-4 text-slate-800 shadow-2xl">
          <button 
            onClick={() => login()}
            className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black flex items-center justify-center gap-3 transition-transform active:scale-95"
          >
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
            Sign in with Google
            <ArrowRight size={20} />
          </button>
          
          <div className="mt-6 text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Signup Bonus</p>
            <p className="text-xs font-semibold text-slate-600">Get ₹30 instantly on your first signup!</p>
          </div>
        </div>
        
        <p className="text-center text-[10px] text-indigo-200 opacity-60">
          By signing in, you agree to our Terms of Service & Privacy Policy.
        </p>
      </div>
      
      {/* Decorative blobs */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-30"></div>
      <div className="absolute top-1/2 -left-20 w-48 h-48 bg-blue-400 rounded-full blur-3xl opacity-20"></div>
    </div>
  );
};

export default Login;
