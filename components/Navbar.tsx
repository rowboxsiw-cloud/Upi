
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, QrCode, History, User, Send, Gift } from 'lucide-react';

const Navbar: React.FC = () => {
  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/history', icon: History, label: 'History' },
    { to: '/scan', icon: QrCode, label: 'Scan', primary: true },
    { to: '/rewards', icon: Gift, label: 'Rewards' },
    { to: '/my-qr', icon: User, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-slate-900/80 backdrop-blur-xl border-t border-white/5 px-6 py-3 flex items-center justify-between z-50">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => 
            `flex flex-col items-center justify-center transition-all ${
              item.primary 
                ? 'bg-indigo-600 text-white p-4 rounded-3xl -mt-12 shadow-[0_15px_30px_rgba(79,70,229,0.4)] border-4 border-slate-950 active:scale-90' 
                : isActive ? 'text-indigo-400 scale-110' : 'text-slate-600'
            }`
          }
        >
          {/* Use NavLink children as a function to access the isActive state correctly */}
          {({ isActive }) => (
            <>
              <item.icon size={item.primary ? 28 : 22} strokeWidth={isActive ? 3 : 2} />
              {!item.primary && <span className={`text-[9px] mt-1.5 font-black uppercase tracking-tighter ${isActive ? 'opacity-100' : 'opacity-40'}`}>{item.label}</span>}
            </>
          )}
        </NavLink>
      ))}
    </div>
  );
};

export default Navbar;
