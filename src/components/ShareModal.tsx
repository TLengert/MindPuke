import { useState } from 'react';
import { Lock, X } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void;
}

export default function ShareModal({ isOpen, onClose, onConfirm }: ShareModalProps) {
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
          <div className="p-2 bg-purple-500/20 rounded-xl">
            <Lock className="w-6 h-6 text-purple-500" />
          </div>
          <h2 className="text-xl font-bold text-white">Secure Export</h2>
        </div>

        <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
          When you set a master password, this will allow you to recover the file and share the file with others securely. Only those with this password or your Kinde Account can open the resulting <span className="text-purple-400 font-mono">.mpuke</span> file.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
              Master Recovery Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="Enter a secure password..."
            />
          </div>

          <button
            onClick={() => {
              if (password) onConfirm(password);
            }}
            disabled={!password}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Encrypt & Download
          </button>
        </div>
      </div>
    </div>
  );
}
