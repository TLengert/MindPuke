import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
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

export let activeUserId = 'guest';
export const setActiveUserId = (id: string | undefined | null) => {
  activeUserId = id || 'guest';
};


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
  // Sidebar & Theme State
  isSidebarOpen: boolean;
  sidebarSide: 'left' | 'right';
  theme: string;
  isPinned: boolean;
  isSidebarHidden: boolean;
  toggleSidebar: () => void;
  setSidebarSide: (side: 'left' | 'right') => void;
  setTheme: (theme: string) => void;
  togglePin: () => void;
  setSidebarHidden: (hidden: boolean) => void;
  // Node Management
  deleteNode: (nodeId: string) => void;
  updateNodeColor: (nodeId: string, color: string) => void;
  // Local First & Export
  unexportedChanges: boolean;
  markExported: () => void;
  markChanged: () => void;
  importData: (nodes: Node[], edges: Edge[]) => void;
}

export const THEME_CONFIG: Record<string, string> = {
  oled: '#A855F7',
  ocean: '#3B82F6',
  neon: '#EC4899',
};

const useStore = create<RFState>()(
  persist(
    (set, get) => ({
      nodes: [
        {
          id: 'root',
          type: 'mindmap',
          data: { label: 'Root', autoFocus: false },
          position: { x: 500, y: 500 },
        },
      ],
      edges: [],
      unexportedChanges: false,
      markExported: () => set({ unexportedChanges: false }),
      markChanged: () => set({ unexportedChanges: true }),
      importData: (nodes, edges) => set({ nodes, edges, unexportedChanges: false }),
      onNodesChange: (changes) => {
        set({
          nodes: applyNodeChanges(changes, get().nodes),
          unexportedChanges: true,
        });
      },
      onEdgesChange: (changes) => {
        set({
          edges: applyEdgeChanges(changes, get().edges),
          unexportedChanges: true,
        });
      },
      onConnect: (connection: Connection) => {
        const { theme } = get();
        const color = THEME_CONFIG[theme];

    const newEdge = {
      ...connection,
      id: crypto.randomUUID(),
      style: color && theme !== 'custom' ? { stroke: color } : undefined,
    } as Edge;
    
    set({
      edges: addEdge(newEdge, get().edges),
    });
  },
  setNodes: (nodes) => {
    set({ nodes });
  },
  setEdges: (edges) => {
    set({ edges });
  },
  addNode: (x, y) => {
    const { theme, nodes } = get();
    const color = THEME_CONFIG[theme];
    const newNodeId = crypto.randomUUID();
    const newNode: Node = {
      id: newNodeId,
      type: 'mindmap',
      position: { x, y },
      data: { label: 'New Thought', autoFocus: true, color: theme !== 'custom' ? color : undefined },
    };
    set({ nodes: nodes.concat(newNode) });
  },
  addChildNode: (parentNodeId) => {
    const { nodes, edges, theme } = get();
    const parentNode = nodes.find((n) => n.id === parentNodeId);
    if (!parentNode) return;

    const color = THEME_CONFIG[theme];

    const newNodeId = crypto.randomUUID();
    const newNode: Node = {
      id: newNodeId,
      type: 'mindmap',
      // Offset by 200px to give room for the node width (~150px gap requested)
      position: { x: parentNode.position.x + 200, y: parentNode.position.y },
      data: { label: 'New Thought', autoFocus: true, color: theme !== 'custom' ? color : undefined },
    };

    const newEdge: Edge = {
      id: crypto.randomUUID(),
      source: parentNodeId,
      target: newNodeId,
      type: 'default',
      style: color && theme !== 'custom' ? { stroke: color } : undefined,
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
  // Sidebar & Theme Actions
  isSidebarOpen: true,
  sidebarSide: 'right',
  theme: 'oled',
  isPinned: false,
  isSidebarHidden: false,
  toggleSidebar: () => {
    set({ isSidebarOpen: !get().isSidebarOpen });
  },
  setSidebarSide: (side) => {
    set({ sidebarSide: side });
  },
  setTheme: (theme) => {
    const color = THEME_CONFIG[theme];
    if (theme !== 'custom' && color) {
      set({ 
        theme,
        nodes: get().nodes.map(n => ({ ...n, data: { ...n.data, color } })),
        edges: get().edges.map(e => ({ ...e, style: { ...e.style, stroke: color } }))
      });
    } else {
      set({ theme });
    }
  },
  togglePin: () => {
    set({ isPinned: !get().isPinned });
  },
  setSidebarHidden: (hidden) => {
    set({ isSidebarHidden: hidden });
  },
  // Node Management Actions
  deleteNode: (nodeId) => {
    set({
      nodes: get().nodes.filter((node) => node.id !== nodeId),
      edges: get().edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
    });
  },
      updateNodeColor: (nodeId, color) => {
        set({
          nodes: get().nodes.map((node) => {
            if (node.id === nodeId) {
              return { ...node, data: { ...node.data, color } };
            }
            return node;
          }),
          unexportedChanges: true,
        });
      },
    }),
    {
      name: 'mindpuke-v1',
      storage: createJSONStorage(() => ({
        getItem: (name) => localStorage.getItem(`${name}-${activeUserId}`),
        setItem: (name, value) => localStorage.setItem(`${name}-${activeUserId}`, value),
        removeItem: (name) => localStorage.removeItem(`${name}-${activeUserId}`),
      })),
    }
  )
);

export default useStore;
