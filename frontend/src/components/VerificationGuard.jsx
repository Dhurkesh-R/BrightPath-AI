// components/VerificationGuard.jsx
import React from 'react';
import { ShieldAlert, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext'; // Assuming you have an AuthContext

export default function VerificationGuard({ children }) {
  const { user, logout } = useAuth();
  const parsedUser = JSON.parse(user)
  const isVerified = parsedUser.is_verified

  console.log(parsedUser)
  console.log(user)

  if (user && !isVerified) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
        <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-3xl p-8 border border-red-500/30 text-center shadow-2xl animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="text-red-500" size={40} />
          </div>
          <h2 className="text-2xl font-black mb-2">Account Pending Verification</h2>
          <p className="text-sm opacity-60 mb-8">
            Your account for <b>BrightPathAI</b> is currently under review. 
            An admin needs to verify your school identity before you can access 10th Grade resources.
          </p>
          <div className="flex flex-col gap-3">
            <div className="p-3 bg-blue-500/5 rounded-xl border border-blue-500/20 text-xs font-bold text-blue-500 italic">
              Estimated wait time: 1-2 school days
            </div>
            <button 
              onClick={logout}
              className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gray-500/10 hover:bg-gray-500/20 font-bold transition-all"
            >
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
