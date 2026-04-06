import { ReactFlow, Background, Controls, MiniMap, Panel, BackgroundVariant, ReactFlowProvider, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useShallow } from 'zustand/react/shallow';
import useStore from './store/useStore';
import { Brain } from 'lucide-react';
import MindMapNode from './components/MindMapNode';

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
});

function Flow() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode } = useStore(useShallow(selector));
  const { screenToFlowPosition } = useReactFlow();

  const onPaneClick = (event: React.MouseEvent) => {
    if (event.detail === 2) {
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      addNode(position.x, position.y);
    }
  };

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onPaneClick={onPaneClick}
      nodeTypes={nodeTypes}
      fitView
      snapToGrid={true}
      snapGrid={[15, 15]}
      colorMode="dark"
    >
      <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#1A1A1A" />
      <Controls />
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

export default function App() {
  return (
    <div className="w-full h-full bg-transparent">
      <ReactFlowProvider>
        <Flow />
      </ReactFlowProvider>
    </div>
  );
}
