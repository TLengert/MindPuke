import { ReactFlow, Background, Controls, MiniMap, Panel, BackgroundVariant, ReactFlowProvider, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useShallow } from 'zustand/react/shallow';
import useStore, { setActiveUserId } from './store/useStore';
import { Brain } from 'lucide-react';
import MindMapNode from './components/MindMapNode';
import Sidebar from './components/Sidebar';
import ContextMenu from './components/ContextMenu';
import Login from './components/Login';
import { useCallback, useState, useEffect } from 'react';
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
  addNode: state.addNode,
  isPinned: state.isPinned,
  setSidebarHidden: state.setSidebarHidden,
});

function Flow() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode, isPinned, setSidebarHidden } = useStore(useShallow(selector));
  const { screenToFlowPosition } = useReactFlow();

  const [menu, setMenu] = useState<{ x: number, y: number, type: 'node' | 'pane', id?: string, data?: any } | null>(null);

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
      onPaneClick={onPaneClick}
      onNodeClick={onNodeClick}
      onPaneContextMenu={onPaneContextMenu}
      onNodeContextMenu={onNodeContextMenu}
      onMoveStart={onMoveStart}
      onNodeDragStart={onNodeDragStart}
      nodeTypes={nodeTypes}
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
      <Panel position="top-left" className="p-4 flex items-center gap-2 bg-black/50 backdrop-blur-md border border-white/10 rounded-lg m-4">
        <Brain className="w-6 h-6 text-purple-500" />
        <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
          MindPuke
        </h1>
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
