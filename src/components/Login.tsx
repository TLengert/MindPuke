import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { Brain } from "lucide-react";

export default function Login() {
  const { login, register, isLoading } = useKindeAuth();

  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a0a0a]">
        <Brain className="w-8 h-8 text-purple-500 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center" style={{ background: 'radial-gradient(circle, #0a0a0a 0%, #000000 100%)' }}>
      <div className="flex flex-col items-center gap-8 max-w-sm w-full p-8 rounded-3xl bg-[rgba(10,10,10,0.75)] backdrop-blur-[12px] border border-zinc-800 shadow-[0_0_50px_rgba(168,85,247,0.1)]">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.2)] mb-2">
            <Brain className="w-10 h-10 text-purple-500" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">MindPuke</h1>
          <p className="text-zinc-500 text-sm">A fast, local-first mapping experience.</p>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <button 
            onClick={() => register()}
            type="button"
            className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-purple-600 hover:bg-purple-500 transition-colors shadow-[0_0_15px_rgba(168,85,247,0.4)]"
          >
            Get Started
          </button>
          <button 
            onClick={() => login()}
            type="button"
            className="w-full py-3 px-4 rounded-xl font-medium text-zinc-300 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:text-white transition-all"
          >
            Log In
          </button>
        </div>
      </div>
    </div>
  );
}
