
import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../App';
import { ref, query, orderByChild, limitToLast, onValue } from 'firebase/database';
import { db } from '../firebase';
import { Transaction } from '../types';
import { ArrowUpRight, ArrowDownLeft, Scan, Send, Wallet, RefreshCw, Smartphone, CreditCard, PieChart, TrendingUp, Gift } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import AIAssistant from '../components/AIAssistant';

const Dashboard: React.FC = () => {
  const { authState, logout } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authState.user) return;
    const txRef = ref(db, `transactions/${authState.user.uid}`);
    const q = query(txRef, orderByChild('timestamp'), limitToLast(50));
    return onValue(q, (snapshot) => {
      if (snapshot.exists()) {
        const list = Object.values(snapshot.val()) as Transaction[];
        setTransactions(list.sort((a, b) => b.timestamp - a.timestamp));
      }
    });
  }, [authState.user]);

  const spendingAnalytics = useMemo(() => {
    const categories = { Food: 0, Shopping: 0, Bills: 0, Other: 0 };
    transactions.filter(t => t.type === 'debit').forEach(t => {
      const note = t.note?.toLowerCase() || '';
      if (note.includes('food') || note.includes('eat')) categories.Food += t.amount;
      else if (note.includes('shop') || note.includes('amazon')) categories.Shopping += t.amount;
      else if (note.includes('bill') || note.includes('recharge')) categories.Bills += t.amount;
      else categories.Other += t.amount;
    });
    const total = Object.values(categories).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(categories).map(([name, value]) => ({ name, value, percent: (value / total) * 100 }));
  }, [transactions]);

  return (
    <div className="pb-24 bg-slate-950 min-h-screen text-slate-100 animate-in fade-in duration-700">
      {/* Premium Header */}
      <div className="bg-gradient-to-br from-indigo-700 via-indigo-800 to-indigo-950 px-6 pt-8 pb-20 rounded-b-[3rem] shadow-[0_20px_50px_rgba(79,70,229,0.3)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
        
        <div className="flex justify-between items-center mb-8 relative z-10">
          <div className="flex items-center gap-3">
            <img 
              src={authState.user?.photoURL || 'https://picsum.photos/100/100'} 
              className="w-12 h-12 rounded-2xl border-2 border-white/20 shadow-xl"
              alt="Profile"
            />
            <div>
              <p className="text-[10px] uppercase tracking-widest text-indigo-300 font-bold">Priority Member</p>
              <h2 className="font-bold text-lg">{authState.user?.displayName}</h2>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate('/rewards')} className="p-2.5 glass rounded-xl text-yellow-400"><Gift size={20} /></button>
            <button onClick={() => logout()} className="p-2.5 glass rounded-xl text-indigo-200"><RefreshCw size={20} /></button>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-indigo-200 text-sm font-medium opacity-80">Available Balance</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-light text-indigo-300">₹</span>
            <h1 className="text-5xl font-black tracking-tighter">
              {authState.user?.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h1>
          </div>
          <div className="mt-6 flex items-center justify-between">
            <div className="px-3 py-1.5 glass rounded-lg inline-flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-mono font-bold tracking-wider">{authState.user?.vpa}</span>
            </div>
            <div className="flex items-center gap-1 text-green-400 text-xs font-bold">
              <TrendingUp size={14} />
              +2.4% this month
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-10 space-y-6 relative z-20">
        {/* Advanced Quick Actions */}
        <div className="grid grid-cols-4 gap-4 glass p-6 rounded-[2.5rem] shadow-2xl border-white/5">
          {[
            { icon: Scan, label: 'Scan', path: '/scan', color: 'bg-blue-500/20 text-blue-400' },
            { icon: Send, label: 'Send', path: '/send', color: 'bg-purple-500/20 text-purple-400' },
            { icon: CreditCard, label: 'Bills', path: '#', color: 'bg-emerald-500/20 text-emerald-400' },
            { icon: Smartphone, label: 'Mobile', path: '#', color: 'bg-orange-500/20 text-orange-400' },
          ].map((action, idx) => (
            <button
              key={idx}
              onClick={() => action.path !== '#' && navigate(action.path)}
              className="flex flex-col items-center gap-2 group"
            >
              <div className={`${action.color} p-4 rounded-2xl group-active:scale-90 transition-all shadow-lg`}>
                <action.icon size={24} />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{action.label}</span>
            </button>
          ))}
        </div>

        {/* Spending Insights Section */}
        <div className="glass p-6 rounded-[2.5rem] border-white/5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-black text-sm uppercase tracking-widest text-indigo-400">Spending Insights</h3>
            <PieChart size={16} className="text-slate-500" />
          </div>
          <div className="space-y-4">
            {spendingAnalytics.map((cat) => (
              <div key={cat.name}>
                <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-tighter">
                  <span>{cat.name}</span>
                  <span className="text-slate-200">₹{cat.value.toFixed(0)}</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full transition-all duration-1000" 
                    style={{ width: `${cat.percent}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transactions List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="font-black text-sm uppercase tracking-widest text-slate-500">History</h3>
            <Link to="/history" className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest">View History</Link>
          </div>

          <div className="space-y-3">
            {transactions.slice(0, 4).map((tx) => (
              <div key={tx.id} className="glass p-4 rounded-3xl flex items-center justify-between border-white/5 hover:bg-white/[0.07] transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tx.type === 'credit' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                    {tx.type === 'credit' ? <ArrowDownLeft size={24} /> : <ArrowUpRight size={24} />}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-100">{tx.type === 'credit' ? tx.fromName : tx.toName}</h4>
                    <p className="text-[10px] font-medium text-slate-500">{format(tx.timestamp, 'dd MMM • hh:mm a')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-black text-sm ${tx.type === 'credit' ? 'text-emerald-400' : 'text-slate-100'}`}>
                    {tx.type === 'credit' ? '+' : '-'} ₹{tx.amount.toLocaleString()}
                  </p>
                  <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{tx.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AIAssistant transactions={transactions} />
    </div>
  );
};

export default Dashboard;
