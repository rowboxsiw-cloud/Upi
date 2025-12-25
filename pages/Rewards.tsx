
import React, { useState } from 'react';
import { useAuth } from '../App';
import { ArrowLeft, Gift, Trophy, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Rewards: React.FC = () => {
  const { authState, updateBalance } = useAuth();
  const navigate = useNavigate();
  const [isScratched, setIsScratched] = useState(false);
  const [winAmount, setWinAmount] = useState(0);

  const scratchCard = () => {
    if (isScratched) return;
    const win = Math.floor(Math.random() * 20) + 1;
    setWinAmount(win);
    setIsScratched(true);
    updateBalance(authState.user!.balance + win);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="p-6 flex items-center gap-4 bg-slate-900 border-b border-white/5">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-full"><ArrowLeft size={24}/></button>
        <h2 className="font-black tracking-tight text-lg">Rewards Hub</h2>
      </div>

      <div className="p-8 space-y-8">
        <div className="bg-gradient-to-br from-yellow-500 to-amber-700 p-8 rounded-[3rem] text-center shadow-2xl shadow-yellow-500/10 relative overflow-hidden">
          <Trophy size={80} className="mx-auto mb-4 text-white opacity-20 absolute top-4 left-4" />
          <h3 className="text-3xl font-black tracking-tighter mb-2">Total Won</h3>
          <p className="text-6xl font-black">₹{winAmount + 12}.00</p>
        </div>

        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Available Cards</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div 
              onClick={scratchCard}
              className={`aspect-square rounded-[2.5rem] relative overflow-hidden cursor-pointer active:scale-95 transition-all ${isScratched ? 'bg-indigo-900/20' : 'bg-indigo-600 shadow-2xl shadow-indigo-500/20'}`}
            >
              {!isScratched ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                  <Sparkles size={40} className="mb-2 text-indigo-300 animate-pulse" />
                  <p className="font-black text-sm uppercase">Tap to Scratch</p>
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center animate-in zoom-in">
                  <p className="text-[10px] font-black uppercase text-indigo-400 mb-1">You Won</p>
                  <p className="text-4xl font-black">₹{winAmount}</p>
                </div>
              )}
            </div>

            <div className="aspect-square bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-white/5 flex flex-col items-center justify-center p-4 text-center opacity-50">
              <Gift size={32} className="mb-2 text-slate-600" />
              <p className="font-bold text-[10px] uppercase">Locked</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rewards;
