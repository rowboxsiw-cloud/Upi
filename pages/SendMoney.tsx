
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { ref, get, query, orderByChild, equalTo, push, update, runTransaction } from 'firebase/database';
import { db } from '../firebase';
import { ArrowLeft, Send, AlertCircle, CheckCircle2, XCircle, ShieldCheck, Delete } from 'lucide-react';
import { Transaction } from '../types';
// Fix: Added missing import for date-fns format function
import { format } from 'date-fns';

const SendMoney: React.FC = () => {
  const { vpa: urlVpa } = useParams();
  const navigate = useNavigate();
  const { authState } = useAuth();
  
  const [recipientVpa, setRecipientVpa] = useState(urlVpa || '');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [step, setStep] = useState<'details' | 'pin' | 'status'>('details');
  const [pin, setPin] = useState('');
  const [status, setStatus] = useState<'processing' | 'success' | 'failed'>('processing');
  const [errorMsg, setErrorMsg] = useState('');
  const [recipient, setRecipient] = useState<any>(null);

  useEffect(() => {
    if (urlVpa) lookupRecipient(urlVpa);
  }, [urlVpa]);

  const lookupRecipient = async (vpa: string) => {
    const usersRef = ref(db, 'users');
    const vpaQuery = query(usersRef, orderByChild('vpa'), equalTo(vpa));
    const snapshot = await get(vpaQuery);
    if (snapshot.exists()) {
      setRecipient(Object.values(snapshot.val())[0]);
    } else {
      setRecipient({ displayName: vpa.split('@')[0], vpa: vpa });
    }
  };

  const startPayment = () => {
    if (!amount || Number(amount) <= 0) return alert("Invalid amount");
    if (Number(amount) > (authState.user?.balance || 0)) return alert("Insufficient funds");
    setStep('pin');
  };

  const handlePinInput = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        // Automatically proceed when 4 digits are entered
        setTimeout(() => processPayment(), 300);
      }
    }
  };

  const processPayment = async () => {
    setStep('status');
    setStatus('processing');

    try {
      const senderUid = authState.user!.uid;
      const sendAmount = Number(amount);
      const senderRef = ref(db, `users/${senderUid}`);
      
      const usersRef = ref(db, 'users');
      const vpaQuery = query(usersRef, orderByChild('vpa'), equalTo(recipientVpa));
      const recipientSnapshot = await get(vpaQuery);
      
      let recipientUid = '';
      let recipientName = recipientVpa.split('@')[0];
      
      if (recipientSnapshot.exists()) {
        const data = recipientSnapshot.val();
        recipientUid = Object.keys(data)[0];
        recipientName = data[recipientUid].displayName;
      }

      await runTransaction(senderRef, (user) => {
        if (user && user.balance >= sendAmount) {
          user.balance -= sendAmount;
        }
        return user;
      });

      if (recipientUid) {
        const recRef = ref(db, `users/${recipientUid}`);
        await runTransaction(recRef, (user) => {
          if (user) user.balance = (user.balance || 0) + sendAmount;
          return user;
        });
      }

      const txData: Omit<Transaction, 'id'> = {
        amount: sendAmount,
        timestamp: Date.now(),
        fromVpa: authState.user!.vpa,
        toVpa: recipientVpa,
        fromName: authState.user!.displayName,
        toName: recipientName,
        status: 'completed',
        type: 'debit',
        note: note
      };

      const senderTxRef = push(ref(db, `transactions/${senderUid}`));
      await update(senderTxRef, { ...txData, id: senderTxRef.key });

      if (recipientUid) {
        const receiverTxRef = push(ref(db, `transactions/${recipientUid}`));
        await update(receiverTxRef, { ...txData, id: receiverTxRef.key, type: 'credit' });
      }

      setStatus('success');
    } catch (error: any) {
      setErrorMsg(error.message);
      setStatus('failed');
    }
  };

  if (step === 'pin') {
    return (
      <div className="h-screen bg-slate-950 flex flex-col items-center p-8 animate-in slide-in-from-right duration-300 text-white">
        <div className="mt-12 text-center space-y-2">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-500/20">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-xl font-black uppercase tracking-widest">Enter Secure PIN</h2>
          <p className="text-slate-500 text-sm">Transferring ₹{amount} to {recipient?.displayName}</p>
        </div>

        <div className="mt-12 flex gap-4">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${pin.length > i ? 'bg-indigo-500 border-indigo-500 scale-125' : 'border-slate-700'}`}></div>
          ))}
        </div>

        <div className="mt-auto mb-12 grid grid-cols-3 gap-8 w-full max-w-xs">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'delete'].map((k, i) => (
            <button 
              key={i} 
              onClick={() => k === 'delete' ? setPin(pin.slice(0, -1)) : k !== '' && handlePinInput(k)}
              className="w-16 h-16 flex items-center justify-center text-2xl font-black hover:bg-white/5 rounded-full active:scale-90 transition-all"
            >
              {k === 'delete' ? <Delete /> : k}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === 'status') {
    return (
      <div className="h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center text-white">
        {status === 'processing' && (
          <div className="space-y-6">
            <div className="w-24 h-24 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="font-bold tracking-widest uppercase animate-pulse text-indigo-400">Securing Transaction...</p>
          </div>
        )}
        {status === 'success' && (
          <div className="animate-in zoom-in duration-500 space-y-6 w-full max-w-sm">
            <div className="w-28 h-28 bg-emerald-500/20 text-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20">
              <CheckCircle2 size={64} />
            </div>
            <div>
              <h2 className="text-4xl font-black tracking-tighter">Success!</h2>
              <p className="text-slate-400 mt-2">Sent <span className="text-white font-bold">₹{amount}</span> to <span className="text-white font-bold">{recipient?.displayName}</span></p>
            </div>
            <div className="p-4 glass rounded-3xl text-left space-y-2">
              <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                <span>Transaction ID</span>
                <span className="text-slate-300">PF{Date.now().toString().slice(-8)}</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                <span>Date & Time</span>
                <span className="text-slate-300">{format(Date.now(), 'dd MMM, hh:mm a')}</span>
              </div>
            </div>
            <button onClick={() => navigate('/')} className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black text-lg shadow-xl shadow-indigo-500/20 active:scale-95 transition-all">Done</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <div className="p-6 flex items-center gap-4 bg-slate-900 border-b border-white/5">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-full"><ArrowLeft size={24}/></button>
        <h2 className="font-black tracking-tight text-lg">Send Money</h2>
      </div>

      <div className="p-6 space-y-8 flex-1">
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Recipient UPI ID</label>
          <input 
            value={recipientVpa}
            onChange={(e) => setRecipientVpa(e.target.value)}
            onBlur={() => lookupRecipient(recipientVpa)}
            className="w-full bg-slate-900 border border-white/5 p-5 rounded-3xl text-xl font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
            placeholder="name@payfast"
          />
          {recipient && (
            <div className="p-4 glass rounded-3xl flex items-center gap-4 animate-in fade-in">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center font-black text-lg">
                {recipient.displayName?.charAt(0)}
              </div>
              <div>
                <p className="font-black text-slate-100">{recipient.displayName}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{recipientVpa}</p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4 text-center">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Amount</label>
          <div className="flex items-center justify-center gap-2">
            <span className="text-4xl font-light text-slate-600">₹</span>
            <input 
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-transparent text-6xl font-black w-full text-center outline-none placeholder:text-slate-900"
              placeholder="0"
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Add a Note</label>
          <input 
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full bg-slate-900 border border-white/5 p-5 rounded-3xl font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
            placeholder="What's this for?"
          />
        </div>

        <div className="mt-auto pb-8">
          <button 
            onClick={startPayment}
            disabled={!amount || !recipientVpa}
            className="w-full py-6 bg-indigo-600 text-white rounded-[2.5rem] font-black text-xl shadow-2xl shadow-indigo-500/20 active:scale-95 transition-all disabled:opacity-20"
          >
            Pay Securely
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendMoney;
