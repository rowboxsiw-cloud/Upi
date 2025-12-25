
import React from 'react';
import { useAuth } from '../App';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, Copy, Share2, LogOut, ChevronRight, ShieldCheck, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MyQR: React.FC = () => {
  const { authState, logout } = useAuth();
  const navigate = useNavigate();
  const user = authState.user;

  const upiLink = `upi://pay?pa=${user?.vpa}&pn=${encodeURIComponent(user?.displayName || '')}&cu=INR`;

  const copyVpa = () => {
    if (user?.vpa) {
      navigator.clipboard.writeText(user.vpa);
      alert('UPI ID Copied!');
    }
  };

  return (
    <div className="min-h-screen bg-indigo-600 pb-24">
      <div className="p-6 flex items-center justify-between text-white">
        <button onClick={() => navigate('/')} className="p-2 bg-white/10 rounded-full">
          <ArrowLeft size={24} />
        </button>
        <h2 className="font-bold text-lg">Profile & My QR</h2>
        <div className="w-10"></div>
      </div>

      <div className="px-6 space-y-6 mt-4">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-6 shadow-xl text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full -mr-8 -mt-8 opacity-50"></div>
          
          <img 
            src={user?.photoURL || 'https://picsum.photos/200/200'} 
            className="w-20 h-20 rounded-full mx-auto border-4 border-white shadow-lg relative z-10"
            alt="Profile"
          />
          <h3 className="mt-4 font-bold text-xl text-slate-800">{user?.displayName}</h3>
          <p className="text-slate-400 text-sm">{user?.email}</p>

          <div className="mt-8 mb-4 flex justify-center">
            <div className="p-4 bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-slate-100">
              <QRCodeSVG value={upiLink} size={160} />
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl flex items-center justify-between mt-6 group active:bg-slate-100 transition-colors cursor-pointer" onClick={copyVpa}>
            <div className="text-left">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Your UPI ID</p>
              <p className="text-indigo-600 font-bold tracking-tight">{user?.vpa}</p>
            </div>
            <Copy size={18} className="text-indigo-500" />
          </div>

          <button className="mt-6 w-full py-3 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors">
            <Share2 size={18} />
            Share QR Code
          </button>
        </div>

        {/* Menu Items */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-lg">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between hover:bg-slate-50 cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
              <span className="font-semibold text-slate-700 text-sm">Security & Privacy</span>
            </div>
            <ChevronRight size={18} className="text-slate-300" />
          </div>
          <div className="p-4 border-b border-slate-100 flex items-center justify-between hover:bg-slate-50 cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <HelpCircle size={20} />
              </div>
              <span className="font-semibold text-slate-700 text-sm">Help & Support</span>
            </div>
            <ChevronRight size={18} className="text-slate-300" />
          </div>
          <div 
            onClick={() => logout()}
            className="p-4 flex items-center justify-between hover:bg-red-50 text-red-500 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center">
                <LogOut size={20} />
              </div>
              <span className="font-semibold text-sm">Logout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyQR;
