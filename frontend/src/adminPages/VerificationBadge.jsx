import React, { useState } from 'react';
import { ShieldCheck, Loader2, CheckCircle2 } from "lucide-react";
import { verifyUserAccount } from "../services/api";

export default function VerifyButton({ userId, isVerified, onRefresh }) {
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    try {
      await verifyUserAccount(userId);
      onRefresh(); // Trigger a reload of the users list in parent
    } catch (err) {
      alert("Error verifying user: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (isVerified) {
    return (
      <div className="flex items-center gap-1 text-green-500 font-bold text-[10px] bg-green-500/10 px-2 py-1 rounded-full uppercase tracking-tighter">
        <CheckCircle2 size={12} /> Verified
      </div>
    );
  }

  return (
    <button
      onClick={handleVerify}
      disabled={loading}
      className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-blue-500/20"
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <ShieldCheck size={14} />
      )}
      Approve
    </button>
  );
}
