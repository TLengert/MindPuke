import { useShallow } from 'zustand/react/shallow';
import useStore from '../store/useStore';
import { 
  ChevronLeft, 
  ChevronRight, 
  PanelLeft, 
  PanelRight, 
  Palette, 
  Brain,
  Zap,
  Droplets,
  Cloud,
  Pin,
  PinOff,
  Download,
  Upload,
  LogOut,
  Database,
  Plus
} from 'lucide-react';
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { useState } from 'react';
import ShareModal from './ShareModal';
import UnlockModal from './UnlockModal';
import { generateFileKey, wrapFileKey, unwrapFileKey, encryptMap, decryptMap, type MpukeEnvelope } from '../lib/crypto';

const selector = (state: any) => ({
  isSidebarOpen: state.isSidebarOpen,
  sidebarSide: state.sidebarSide,
  theme: state.theme,
  isPinned: state.isPinned,
  isSidebarHidden: state.isSidebarHidden,
  toggleSidebar: state.toggleSidebar,
  setSidebarSide: state.setSidebarSide,
  setTheme: state.setTheme,
  togglePin: state.togglePin,
  setSidebarHidden: state.setSidebarHidden,
  unexportedChanges: state.unexportedChanges,
  markExported: state.markExported,
  importData: state.importData,
  nodes: state.nodes,
  edges: state.edges,
  maps: state.maps,
  currentMapId: state.currentMapId,
  createMap: state.createMap,
  switchMap: state.switchMap,
  deleteMap: state.deleteMap,
});

export default function Sidebar() {
  const { 
    isSidebarOpen, 
    sidebarSide, 
    theme, 
    isPinned,
    isSidebarHidden,
    toggleSidebar, 
    setSidebarSide, 
    setTheme,
    togglePin,
    setSidebarHidden,
    unexportedChanges,
    markExported,
    importData,
    nodes,
    edges,
    maps,
    currentMapId,
    createMap,
    switchMap,
    deleteMap
  } = useStore(useShallow(selector));

  const { user, logout } = useKindeAuth();

  // Modals state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [unlockError, setUnlockError] = useState('');
  const [pendingEnvelope, setPendingEnvelope] = useState<MpukeEnvelope | null>(null);

  const handleShareClick = () => {
    setIsShareModalOpen(true);
  };

  const executeShareDownload = async (password: string) => {
    try {
      const fileKey = await generateFileKey();
      
      const wrappedMaster = await wrapFileKey(fileKey, password, 'master');
      const keys = [wrappedMaster];

      if (user?.id) {
        const wrappedKinde = await wrapFileKey(fileKey, user.id, 'kinde-id', user.id);
        keys.push(wrappedKinde);
      }

      const mapData = { nodes, edges };
      const { payload, iv } = await encryptMap(fileKey, mapData);

      const envelope: MpukeEnvelope = {
        metadata: {
          version: 1,
          keys,
          payloadIv: iv
        },
        payload
      };

      const dataStr = JSON.stringify(envelope, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mindpuke-map.mpuke';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      markExported();
      setIsShareModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to encrypt and export map.");
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const envelope = JSON.parse(event.target?.result as string) as MpukeEnvelope;
        if (!envelope.metadata || !envelope.metadata.keys) {
          throw new Error("Invalid .mpuke structure");
        }

        // Smart Unlock via Kinde ID
        const activeId = user?.id || 'guest';
        const kindeKeyDoc = envelope.metadata.keys.find(k => k.type === 'kinde-id' && k.userId === activeId);

        if (kindeKeyDoc && activeId !== 'guest') {
          // Success: Auto-decrypt!
          const fileKey = await unwrapFileKey(kindeKeyDoc, activeId);
          const mapData = await decryptMap(fileKey, envelope.payload, envelope.metadata.payloadIv);
          if (mapData.nodes && mapData.edges) {
            importData(mapData.nodes, mapData.edges);
          }
        } else {
          // Failure: Trigger Master Password Handshake
          setPendingEnvelope(envelope);
          setUnlockError('');
          setIsUnlockModalOpen(true);
        }
      } catch (err) {
        console.error(err);
        alert("Failed to parse .mpuke map. Ensure it is a valid file.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const executeUnlock = async (password: string) => {
    if (!pendingEnvelope) return;
    
    try {
      const masterKeyDoc = pendingEnvelope.metadata.keys.find(k => k.type === 'master');
      if (!masterKeyDoc) throw new Error("No master recovery hash found on file.");

      const fileKey = await unwrapFileKey(masterKeyDoc, password);
      const mapData = await decryptMap(fileKey, pendingEnvelope.payload, pendingEnvelope.metadata.payloadIv);

      if (mapData.nodes && mapData.edges) {
        // We successfully decrypted it. The Handshake is complete.
        // We push to Zustand, updating the local partitioned cache seamlessly!
        importData(mapData.nodes, mapData.edges);
        setIsUnlockModalOpen(false);
        setPendingEnvelope(null);
      } else {
        throw new Error("Invalid map data payload.");
      }
    } catch (err) {
      console.error(err);
      setUnlockError('Incorrect Master Password.');
    }
  };

  const handleLogout = () => {
    if (unexportedChanges) {
      if (!window.confirm("You have unsaved changes! Proceed with logout anyway?")) {
        return;
      }
    }
    logout();
  };

  const themes = [
    { id: 'royal', label: 'Royal Gold', icon: <Zap className="w-4 h-4" color="#FFD700" /> },
    { id: 'oled', label: 'OLED Dark', icon: <Zap className="w-4 h-4" color="#A855F7" /> },
    { id: 'ocean', label: 'Ocean Blue', icon: <Droplets className="w-4 h-4" color="#3B82F6" /> },
    { id: 'neon', label: 'Neon Pink', icon: <Cloud className="w-4 h-4" color="#EC4899" /> },
    { id: 'custom', label: 'Custom', icon: <Palette className="w-4 h-4" color="#71717A" /> },
  ];

  // Calculate transform based on side and focus state
  const isActuallyHidden = isSidebarHidden && !isPinned;
  const translation = isActuallyHidden
    ? sidebarSide === 'right' ? 'translateX(calc(100% - 24px))' : 'translateX(calc(-100% + 24px))'
    : 'translateX(0)';

  return (
    <aside 
      className={`fixed top-4 bottom-4 z-[100] transition-all duration-500
        ${sidebarSide === 'left' ? 'left-4' : 'right-4'}
        ${isSidebarOpen ? 'w-[280px]' : 'w-[64px]'}
        bg-[rgba(10,10,10,0.75)] backdrop-blur-[12px] border border-zinc-800 rounded-2xl
        flex flex-col shadow-2xl
      `}
      style={{ 
        transform: translation,
        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {/* Handle for recovery when hidden */}
      {isActuallyHidden && (
        <button
          onClick={() => setSidebarHidden(false)}
          className={`absolute top-0 bottom-0 w-6 z-[110] flex items-center justify-center group
            ${sidebarSide === 'left' ? 'right-0' : 'left-0'}
          `}
        >
          <div className="w-1 h-12 bg-purple-500/40 rounded-full group-hover:bg-purple-500 transition-colors animate-handle-glow" />
        </button>
      )}

      {/* Header */}
      <div className={`p-4 flex items-center justify-between border-b border-zinc-800/50 ${isActuallyHidden ? 'opacity-0' : 'opacity-100'} transition-opacity`}>
        {isSidebarOpen ? (
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-500" />
            <span className="font-bold text-white tracking-tight">MindPuke</span>
          </div>
        ) : (
          <Brain className="w-6 h-6 text-purple-500 mx-auto" />
        )}
        
        {isSidebarOpen && (
          <div className="flex gap-1">
            <button 
              onClick={togglePin}
              className={`p-1.5 rounded-lg transition-colors ${isPinned ? 'bg-purple-500/20 text-purple-400' : 'hover:bg-white/10 text-zinc-400'}`}
              title={isPinned ? 'Unpin Sidebar' : 'Pin Sidebar'}
            >
              {isPinned ? <Pin className="w-4 h-4" /> : <PinOff className="w-4 h-4" />}
            </button>
            <button 
              onClick={() => setSidebarSide(sidebarSide === 'left' ? 'right' : 'left')}
              className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 transition-colors"
              title={`Switch to ${sidebarSide === 'left' ? 'right' : 'left'}`}
            >
              {sidebarSide === 'left' ? <PanelRight className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
            </button>
            <button 
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 transition-colors"
            >
              {sidebarSide === 'left' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>

      {!isSidebarOpen && (
        <button 
          onClick={toggleSidebar}
          className="mt-2 p-3 rounded-lg hover:bg-white/10 text-zinc-400 transition-colors mx-auto"
        >
          {sidebarSide === 'left' ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      )}

      {/* Content */}
      {isSidebarOpen && (
        <div className={`flex-1 p-4 flex flex-col gap-6 overflow-y-auto ${isActuallyHidden ? 'opacity-0' : 'opacity-100'} transition-opacity`}>
          {/* My Maps Section */}
          <section>
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2 text-zinc-500 uppercase text-[10px] font-bold tracking-widest">
                <Brain className="w-3 h-3" />
                <span>My Maps</span>
              </div>
              <button 
                onClick={() => createMap()}
                className="p-1 px-2 flex items-center gap-1 rounded-md bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 text-[10px] font-bold transition-all"
                title="Create new map"
              >
                <Plus className="w-3 h-3" />
                NEW
              </button>
            </div>
            <div className="flex flex-col gap-1.5 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
              {maps.map((m: any) => (
                <div 
                  key={m.id}
                  className={`group flex items-center gap-2 p-2 rounded-xl transition-all duration-300 border
                    ${currentMapId === m.id 
                      ? 'bg-gradient-to-r from-purple-500/10 to-transparent border-purple-500/30' 
                      : 'bg-transparent border-transparent hover:bg-zinc-900'}
                  `}
                >
                  <button
                    onClick={() => switchMap(m.id)}
                    className="flex-1 flex items-center gap-3 text-left"
                  >
                    <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300
                      ${currentMapId === m.id ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]' : 'bg-zinc-700'}
                    `} />
                    <span className={`text-sm font-medium transition-colors truncate
                      ${currentMapId === m.id ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'}
                    `}>
                      {m.name}
                    </span>
                  </button>
                  
                  {maps.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Delete "${m.name}"?`)) deleteMap(m.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-600 hover:text-red-400 transition-all"
                      title="Delete map"
                    >
                      <LogOut className="w-3 h-3 transform rotate-90" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Themes Section */}
          <section>
            <div className="flex items-center gap-2 mb-3 text-zinc-500 uppercase text-[10px] font-bold tracking-widest px-1">
              <Palette className="w-3 h-3" />
              <span>Map Themes</span>
            </div>
            <div className="flex flex-col gap-2">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-200 group
                    ${theme === t.id 
                      ? 'bg-purple-500/10 border-purple-500/50 text-white shadow-[0_0_15px_rgba(168,85,247,0.15)]' 
                      : 'bg-transparent border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'}
                  `}
                >
                  <div className={`p-1.5 rounded-lg transition-colors 
                    ${theme === t.id ? 'bg-purple-500/20' : 'bg-zinc-900 group-hover:bg-zinc-800'}
                  `}>
                    {t.icon}
                  </div>
                  <span className="text-sm font-medium">{t.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Local Data Section */}
          <section className="mt-4">
            <div className="flex items-center gap-2 mb-3 text-zinc-500 uppercase text-[10px] font-bold tracking-widest px-1">
              <Database className="w-3 h-3" />
              <span>Local Data</span>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleShareClick}
                className="flex items-center justify-between p-3 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-300 transition-all group"
              >
                <span className="flex items-center gap-3 text-sm font-medium">
                  <Download className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                  Share (.mpuke)
                </span>
                {unexportedChanges && <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" title="Unsaved changes" />}
              </button>
              
              <label className="flex items-center gap-3 p-3 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-300 transition-all cursor-pointer group">
                <Upload className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Load from file...</span>
                <input type="file" accept=".mpuke,.json" className="hidden" onChange={handleUpload} />
              </label>
            </div>
          </section>

          {/* User Settings */}
          <section className="mt-auto">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 p-3 text-sm font-semibold rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/10 hover:border-red-500/30 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </section>
        </div>
      )}

      {/* Crypto Modals */}
      <ShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        onConfirm={executeShareDownload} 
      />
      <UnlockModal 
        isOpen={isUnlockModalOpen} 
        onClose={() => setIsUnlockModalOpen(false)} 
        onConfirm={executeUnlock} 
        error={unlockError}
      />
    </aside>
  );
}
