import { 
  ReactFlow, 
  Background, 
  Controls, 
  MiniMap, 
  Panel, 
  BackgroundVariant, 
  ReactFlowProvider, 
  useReactFlow,
  reconnectEdge,
  type Edge,
  type Connection
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useShallow } from 'zustand/react/shallow';
import useStore, { setActiveUserId, THEME_CONFIG } from './store/useStore';
import { Brain, Pencil, Check, X } from 'lucide-react';
import MindMapNode from './components/MindMapNode';
import Sidebar from './components/Sidebar';
import ContextMenu from './components/ContextMenu';
import Login from './components/Login';
import { useCallback, useState, useEffect, useRef } from 'react';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';

const nodeTypes = {
  mindmap: MindMapNode,
};

const selector = (state: any) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
  setEdges: state.setEdges,
  addNode: state.addNode,
  isPinned: state.isPinned,
  setSidebarHidden: state.setSidebarHidden,
  currentMapId: state.currentMapId,
  maps: state.maps,
  renameMap: state.renameMap,
  theme: state.theme,
  customThemeColor: state.customThemeColor,
  edgeType: state.edgeType,
});

function Flow() {
  const { 
    nodes, edges, onNodesChange, onEdgesChange, onConnect, setEdges,
    addNode, isPinned, setSidebarHidden, currentMapId, maps, renameMap, theme, customThemeColor, edgeType
  } = useStore(useShallow(selector));
  const { screenToFlowPosition } = useReactFlow();

  const [menu, setMenu] = useState<{ x: number, y: number, type: 'node' | 'pane' | 'edge', id?: string, data?: any } | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  const currentMap = maps.find((m: any) => m.id === currentMapId);
  const themeColor = theme === 'custom' ? customThemeColor : (THEME_CONFIG[theme] || '#A855F7');

  useEffect(() => {
    if (isEditingName && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [isEditingName]);

  const handleStartEdit = () => {
    setEditedName(currentMap?.name || '');
    setIsEditingName(true);
  };

  const handleSaveName = () => {
    if (editedName.trim()) {
      renameMap(currentMapId, editedName.trim());
    }
    setIsEditingName(false);
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
  };

  const onPaneClick = useCallback((event: any) => {
    setMenu(null);
    if (event.detail === 2) {
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      addNode(position.x, position.y);
    }
  }, [screenToFlowPosition, addNode]);

  const onNodeClick = useCallback(() => {
    setMenu(null);
  }, []);

  const onPaneContextMenu = useCallback(
    (event: any) => {
      event.preventDefault();
      setMenu({
        x: event.clientX,
        y: event.clientY,
        type: 'pane',
      });
    },
    [setMenu]
  );

  const onNodeContextMenu = useCallback(
    (event: any, node: any) => {
      event.preventDefault();
      setMenu({
        x: event.clientX,
        y: event.clientY,
        type: 'node',
        id: node.id,
        data: node.data,
      });
    },
    [setMenu]
  );

  const onEdgeContextMenu = useCallback(
    (event: any, edge: Edge) => {
      event.preventDefault();
      setMenu({
        x: event.clientX,
        y: event.clientY,
        type: 'edge',
        id: edge.id,
      });
    },
    [setMenu]
  );

  const onReconnect = useCallback(
    (oldEdge: Edge, newConnection: Connection) => setEdges(reconnectEdge(oldEdge, newConnection, edges)),
    [edges, setEdges]
  );

  const onMoveStart = useCallback(() => {
    if (!isPinned) {
      setSidebarHidden(true);
    }
  }, [isPinned, setSidebarHidden]);

  const onNodeDragStart = useCallback(() => {
    if (!isPinned) {
      setSidebarHidden(true);
    }
  }, [isPinned, setSidebarHidden]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onReconnect={onReconnect}
      onPaneClick={onPaneClick}
      onNodeClick={onNodeClick}
      onPaneContextMenu={onPaneContextMenu}
      onNodeContextMenu={onNodeContextMenu}
      onEdgeContextMenu={onEdgeContextMenu}
      onMoveStart={onMoveStart}
      onNodeDragStart={onNodeDragStart}
      nodeTypes={nodeTypes}
      edgesReconnectable={true}
      defaultEdgeOptions={{
        style: { stroke: themeColor, strokeWidth: 2 },
        type: edgeType
      }}
      fitView
      snapToGrid={true}
      snapGrid={[15, 15]}
      colorMode="dark"
    >
      <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#1A1A1A" />
      <Controls />
      <Sidebar />
      {menu && <ContextMenu {...menu} onClose={() => setMenu(null)} />}
      <MiniMap 
        style={{ background: '#111' }} 
        nodeColor="#555"
        maskColor="rgba(0, 0, 0, 0.7)"
      />
      <Panel position="top-left" className="p-4 m-4 flex flex-col gap-2 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl transition-all duration-500">
        <div className="flex items-center gap-2.5">
          <Brain 
            className="w-6 h-6 transition-all duration-1000" 
            style={{ 
              color: themeColor,
              filter: `drop-shadow(0 0 8px ${themeColor}80)` 
            }}
          />
          <h1 className="text-xl font-black bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent tracking-tighter">
            MindPuke
          </h1>
        </div>
        
        <div className="group relative flex items-center gap-2 px-1">
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <input
                ref={editInputRef}
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName();
                  if (e.key === 'Escape') handleCancelEdit();
                }}
                className="bg-zinc-800/50 border border-purple-500/50 rounded-md px-2 py-0.5 text-sm text-white outline-none focus:border-purple-500 transition-all w-48"
              />
              <button 
                onClick={handleSaveName}
                className="p-1 rounded-md bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                title="Save name"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={handleCancelEdit}
                className="p-1 rounded-md bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                title="Cancel"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div 
              className="flex items-center gap-2 cursor-pointer transition-all duration-300"
              onClick={handleStartEdit}
            >
              <span className="text-sm font-semibold text-zinc-400 group-hover:text-purple-400 transition-colors tracking-wide truncate max-w-[150px]">
                {currentMap?.name || 'Untitled Journey'}
              </span>
              <Pencil className="w-3 h-3 text-zinc-600 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-[-4px] group-hover:translate-x-0" />
            </div>
          )}
        </div>
      </Panel>
    </ReactFlow>
  );
}

function StoreInit({ userId }: { userId: string | undefined }) {
  useEffect(() => {
    setActiveUserId(userId);
    useStore.persist.rehydrate();
  }, [userId]);
  return null;
}

export default function App() {
  const { isAuthenticated, isLoading, user } = useKindeAuth();

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (useStore.getState().unexportedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#0a0a0a]">
        <Brain className="w-8 h-8 text-purple-500 animate-pulse" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="w-full h-full bg-transparent">
      <ReactFlowProvider>
        <StoreInit userId={user?.id} />
        <Flow />
      </ReactFlowProvider>
    </div>
  );
}
