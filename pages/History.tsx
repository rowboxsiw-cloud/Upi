
import React, { useEffect, useState } from 'react';
import { useAuth } from '../App';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase';
import { Transaction } from '../types';
import { ArrowLeft, Search, Calendar, Filter, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const History: React.FC = () => {
  const { authState } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!authState.user) return;
    const txRef = ref(db, `transactions/${authState.user.uid}`);
    
    return onValue(txRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setTransactions(Object.values(data).sort((a: any, b: any) => b.timestamp - a.timestamp) as Transaction[]);
      }
    });
  }, [authState.user]);

  const filteredTransactions = transactions.filter(tx => 
    tx.toName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    tx.fromName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.toVpa.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="bg-white px-6 pt-8 pb-6 shadow-sm sticky top-0 z-20">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-slate-50 rounded-full">
            <ArrowLeft size={24} className="text-slate-800" />
          </button>
          <h2 className="font-bold text-xl text-slate-800">Transaction History</h2>
        </div>

        <div className="flex gap-3">
          <div className="flex-1 bg-slate-100 rounded-2xl flex items-center px-4 gap-3 focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
            <Search size={18} className="text-slate-400" />
            <input 
              type="text" 
              placeholder="Search name, UPI ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent py-3 flex-1 text-sm focus:outline-none"
            />
          </div>
          <button className="bg-slate-100 p-3 rounded-2xl text-slate-500">
            <Filter size={20} />
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((tx) => (
              <div key={tx.id} className="bg-white p-4 rounded-3xl shadow-sm flex items-center justify-between border border-slate-100 group active:scale-[0.98] transition-all">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${tx.type === 'credit' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {tx.type === 'credit' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">
                      {tx.type === 'credit' ? tx.fromName : tx.toName}
                    </h4>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Calendar size={10} />
                      {format(tx.timestamp, 'dd MMM yyyy, hh:mm a')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-black text-sm ${tx.type === 'credit' ? 'text-green-600' : 'text-slate-800'}`}>
                    {tx.type === 'credit' ? '+' : '-'} ₹{tx.amount.toLocaleString()}
                  </p>
                  <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1">{tx.status}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="text-slate-300" size={32} />
              </div>
              <p className="text-slate-400 font-medium">No transactions found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;
