import { create } from 'zustand';
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type Connection,
} from '@xyflow/react';

interface RFState {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  addNode: (x: number, y: number) => void;
  addChildNode: (parentNodeId: string) => void;
  updateNodeLabel: (nodeId: string, label: string) => void;
}

const useStore = create<RFState>((set, get) => ({
  nodes: [
    {
      id: 'root',
      type: 'mindmap',
      data: { label: 'Root', autoFocus: false },
      position: { x: 500, y: 500 },
    },
  ],
  edges: [],
  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onConnect: (connection: Connection) => {
    set({
      edges: addEdge(connection, get().edges),
    });
  },
  setNodes: (nodes) => {
    set({ nodes });
  },
  setEdges: (edges) => {
    set({ edges });
  },
  addNode: (x, y) => {
    const newNodeId = crypto.randomUUID();
    const newNode: Node = {
      id: newNodeId,
      type: 'mindmap',
      position: { x, y },
      data: { label: 'New Thought', autoFocus: true },
    };
    set({ nodes: get().nodes.concat(newNode) });
  },
  addChildNode: (parentNodeId) => {
    const { nodes, edges } = get();
    const parentNode = nodes.find((n) => n.id === parentNodeId);
    if (!parentNode) return;

    const newNodeId = crypto.randomUUID();
    const newNode: Node = {
      id: newNodeId,
      type: 'mindmap',
      // Offset by 200px to give room for the node width (~150px gap requested)
      position: { x: parentNode.position.x + 200, y: parentNode.position.y },
      data: { label: 'New Thought', autoFocus: true },
    };

    const newEdge: Edge = {
      id: crypto.randomUUID(),
      source: parentNodeId,
      target: newNodeId,
      type: 'default',
    };

    set({
      nodes: nodes.concat(newNode),
      edges: edges.concat(newEdge),
    });
  },
  updateNodeLabel: (nodeId, label) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, label } };
        }
        return node;
      }),
    });
  },
}));

export default useStore;
