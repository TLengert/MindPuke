import { useState } from 'react';
import { Unlock, X, AlertCircle } from 'lucide-react';

interface UnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void;
  error?: string;
}

export default function UnlockModal({ isOpen, onClose, onConfirm, error }: UnlockModalProps) {
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-500/20 rounded-xl">
            <Unlock className="w-6 h-6 text-blue-500" />
          </div>
          <h2 className="text-xl font-bold text-white">Unlock Map</h2>
        </div>

        <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
          This map requires a Master Recovery Password to decrypt. Once unlocked, your Kinde account will be permanently authorized for automatic access in the future.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-400">{error}</span>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
              Master Recovery Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="Enter the Master Password..."
            />
          </div>

          <button
            onClick={() => {
              if (password) onConfirm(password);
            }}
            disabled={!password}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Decrypt & Import
          </button>
        </div>
      </div>
    </div>
  );
}
