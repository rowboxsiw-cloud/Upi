
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { ArrowLeft, Flashlight } from 'lucide-react';

const ScanPay: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    scannerRef.current = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scannerRef.current.render(
      (decodedText) => {
        // Handle UPI deep link or raw VPA
        // upi://pay?pa=name@bank&pn=Name...
        let vpa = decodedText;
        if (decodedText.startsWith('upi://')) {
          const url = new URL(decodedText.replace('upi://', 'http://'));
          vpa = url.searchParams.get('pa') || decodedText;
        }
        
        if (scannerRef.current) {
          scannerRef.current.clear().catch(console.error);
        }
        navigate(`/send/${vpa}`);
      },
      (errorMessage) => {
        // Handle scanning errors silently
      }
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, [navigate]);

  return (
    <div className="h-screen bg-slate-900 flex flex-col">
      <div className="p-6 flex items-center justify-between text-white z-10">
        <button onClick={() => navigate('/')} className="p-2 bg-white/10 rounded-full">
          <ArrowLeft size={24} />
        </button>
        <h2 className="font-bold text-lg">Scan & Pay</h2>
        <button className="p-2 bg-white/10 rounded-full">
          <Flashlight size={24} />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 -mt-12">
        <div id="reader" className="w-full max-w-xs overflow-hidden rounded-3xl border-2 border-indigo-500 shadow-[0_0_50px_rgba(99,102,241,0.3)] bg-slate-800"></div>
        <div className="mt-8 text-center text-slate-400">
          <p className="text-sm font-medium">Place the QR code within the frame</p>
          <p className="text-xs mt-1">Scanning will be automatic</p>
        </div>
      </div>
      
      <div className="p-8 bg-slate-800 rounded-t-[40px]">
        <div className="flex items-center justify-around">
          <button className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-indigo-400">
              <QrCode size={20} />
            </div>
            <span className="text-[10px] text-white">Show My QR</span>
          </button>
          <button className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-indigo-400">
              <User size={20} />
            </div>
            <span className="text-[10px] text-white">Pay Contact</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Simple icons for the scan page buttons
const QrCode = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="10" height="10" x="3" y="3" rx="2"/><rect width="10" height="10" x="11" y="11" rx="2"/><rect width="10" height="10" x="11" y="3" rx="2"/><rect width="10" height="10" x="3" y="11" rx="2"/></svg>
);
const User = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);

export default ScanPay;
