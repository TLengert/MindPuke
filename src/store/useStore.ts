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


interface MapData {
  id: string;
  name: string;
  nodes: Node[];
  edges: Edge[];
  theme: string;
  customThemeColor?: string;
  customNodeColors?: Record<string, string>;
  customEdgeColors?: Record<string, string>;
  edgeType: string;
  createdAt: number;
  lastModified: number;
}

interface RFState {
  nodes: Node[];
  edges: Edge[];
  theme: string;
  customThemeColor: string;
  edgeType: string;
  maps: MapData[];
  currentMapId: string;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  addNode: (x: number, y: number) => void;
  addChildNode: (parentNodeId: string) => void;
  updateNodeLabel: (nodeId: string, label: string) => void;
  // Map Management
  createMap: (name?: string) => void;
  renameMap: (id: string, name: string) => void;
  switchMap: (id: string) => void;
  deleteMap: (id: string) => void;
  // Sidebar & Theme State
  isSidebarOpen: boolean;
  sidebarSide: 'left' | 'right';
  isPinned: boolean;
  isSidebarHidden: boolean;
  toggleSidebar: () => void;
  setSidebarSide: (side: 'left' | 'right') => void;
  setTheme: (theme: string) => void;
  setCustomThemeColor: (color: string) => void;
  setEdgeType: (type: string) => void;
  togglePin: () => void;
  setSidebarHidden: (hidden: boolean) => void;
  // Node Management
  deleteNode: (nodeId: string) => void;
  deleteEdge: (edgeId: string) => void;
  updateNodeColor: (nodeIds: string[], color: string) => void;
  updateEdgeColor: (edgeIds: string[], color: string) => void;
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
  royal: '#FFD700', // Gold for Royal theme
};

const useStore = create<RFState>()(
  persist(
    (set, get) => ({
      nodes: [],
      edges: [],
      maps: [],
      currentMapId: '',
      theme: 'royal',
      customThemeColor: '#A855F7',
      edgeType: 'smoothstep',
      unexportedChanges: false,
      markExported: () => set({ unexportedChanges: false }),
      markChanged: () => set({ unexportedChanges: true }),
      importData: (nodes, edges) => {
        const { currentMapId, maps } = get();
        const newMaps = maps.map(m => 
          m.id === currentMapId ? { ...m, nodes, edges, lastModified: Date.now() } : m
        );
        set({ nodes, edges, maps: newMaps, unexportedChanges: false });
      },
      onNodesChange: (changes) => {
        const newNodes = applyNodeChanges(changes, get().nodes);
        const { currentMapId, maps } = get();
        const newMaps = maps.map(m => 
          m.id === currentMapId ? { ...m, nodes: newNodes, lastModified: Date.now() } : m
        );
        set({
          nodes: newNodes,
          maps: newMaps,
          unexportedChanges: true,
        });
      },
      onEdgesChange: (changes) => {
        const newEdges = applyEdgeChanges(changes, get().edges);
        const { currentMapId, maps } = get();
        const newMaps = maps.map(m => 
          m.id === currentMapId ? { ...m, edges: newEdges, lastModified: Date.now() } : m
        );
        set({
          edges: newEdges,
          maps: newMaps,
          unexportedChanges: true,
        });
      },
        const { theme, customThemeColor, edgeType, currentMapId, maps } = get();
        // Fallback color for new edges
        const color = theme === 'custom' ? customThemeColor : THEME_CONFIG[theme];

        const newEdge = {
          ...connection,
          id: crypto.randomUUID(),
          type: edgeType,
          style: color ? { stroke: color } : {},
        } as Edge;
        
        const newEdges = addEdge(newEdge, get().edges);
        const newMaps = maps.map(m => 
          m.id === currentMapId ? { ...m, edges: newEdges, lastModified: Date.now() } : m
        );

        set({
          edges: newEdges,
          maps: newMaps,
          unexportedChanges: true,
        });
      },
      setNodes: (nodes) => {
        const { currentMapId, maps } = get();
        const newMaps = maps.map(m => 
          m.id === currentMapId ? { ...m, nodes, lastModified: Date.now() } : m
        );
        set({ nodes, maps: newMaps });
      },
      setEdges: (edges) => {
        const { currentMapId, maps } = get();
        const newMaps = maps.map(m => 
          m.id === currentMapId ? { ...m, edges, lastModified: Date.now() } : m
        );
        set({ edges, maps: newMaps });
      },
      addNode: (x, y) => {
        const { theme, customThemeColor, nodes, currentMapId, maps } = get();
        const color = theme === 'custom' ? customThemeColor : THEME_CONFIG[theme];
        const newNodeId = crypto.randomUUID();
        const newNode: Node = {
          id: newNodeId,
          type: 'mindmap',
          position: { x, y },
          data: { label: 'New Thought', autoFocus: true, color: color },
        };
        const newNodes = nodes.concat(newNode);
        const newMaps = maps.map(m => 
          m.id === currentMapId ? { ...m, nodes: newNodes, lastModified: Date.now() } : m
        );
        set({ nodes: newNodes, maps: newMaps, unexportedChanges: true });
      },
      addChildNode: (parentNodeId) => {
        const { nodes, edges, theme, customThemeColor, currentMapId, maps } = get();
        const parentNode = nodes.find((n) => n.id === parentNodeId);
        if (!parentNode) return;

        const color = theme === 'custom' ? customThemeColor : THEME_CONFIG[theme];

        const newNodeId = crypto.randomUUID();
        const newNode: Node = {
          id: newNodeId,
          type: 'mindmap',
          position: { x: parentNode.position.x + 250, y: parentNode.position.y },
          data: { label: 'New Thought', autoFocus: true, color: color },
        };

        const newEdge: Edge = {
          id: crypto.randomUUID(),
          source: parentNodeId,
          target: newNodeId,
          type: get().edgeType,
          style: color ? { stroke: color } : {},
        };

        const newNodes = nodes.concat(newNode);
        const newEdges = edges.concat(newEdge);
        const newMaps = maps.map(m => 
          m.id === currentMapId ? { ...m, nodes: newNodes, edges: newEdges, lastModified: Date.now() } : m
        );

        set({
          nodes: newNodes,
          edges: newEdges,
          maps: newMaps,
          unexportedChanges: true,
        });
      },
      updateNodeLabel: (nodeId, label) => {
        const { currentMapId, maps } = get();
        const newNodes = get().nodes.map((node) => {
          if (node.id === nodeId) {
            return { ...node, data: { ...node.data, label } };
          }
          return node;
        });
        const newMaps = maps.map(m => 
          m.id === currentMapId ? { ...m, nodes: newNodes, lastModified: Date.now() } : m
        );
        set({
          nodes: newNodes,
          maps: newMaps,
          unexportedChanges: true,
        });
      },
      // Map Management Actions
      createMap: (name = 'New Journey') => {
        const newMapId = crypto.randomUUID();
        const newMap: MapData = {
          id: newMapId,
          name,
          nodes: [
            {
              id: 'root',
              type: 'mindmap',
              data: { label: 'Root', autoFocus: false },
              position: { x: 500, y: 500 },
            },
          ],
          edges: [],
          theme: 'royal',
          customThemeColor: '#FFD700',
          edgeType: 'smoothstep',
          createdAt: Date.now(),
          lastModified: Date.now(),
        };
        set((state) => ({
          maps: [...state.maps, newMap],
          currentMapId: newMapId,
          nodes: newMap.nodes,
          edges: newMap.edges,
          theme: newMap.theme,
          customThemeColor: newMap.customThemeColor || '#FFD700',
          unexportedChanges: false,
        }));
      },
      renameMap: (id, name) => {
        set((state) => ({
          maps: state.maps.map((m) => (m.id === id ? { ...m, name, lastModified: Date.now() } : m)),
        }));
      },
      switchMap: (id) => {
        const targetMap = get().maps.find((m) => m.id === id);
        if (targetMap) {
          set({
            currentMapId: id,
            nodes: targetMap.nodes,
            edges: targetMap.edges,
            theme: targetMap.theme || 'royal',
            customThemeColor: targetMap.customThemeColor || '#FFD700',
            edgeType: targetMap.edgeType || 'smoothstep',
            unexportedChanges: false,
          });
        }
      },
      deleteMap: (id) => {
        const { maps, currentMapId } = get();
        const newMaps = maps.filter((m) => m.id !== id);
        if (newMaps.length === 0) {
          // If no maps left, create a default one
          set({ maps: [] });
          get().createMap('My First Journey');
          return;
        }
        if (currentMapId === id) {
          const nextMap = newMaps[0];
          set({
            maps: newMaps,
            currentMapId: nextMap.id,
            nodes: nextMap.nodes,
            edges: nextMap.edges,
            theme: nextMap.theme,
            customThemeColor: nextMap.customThemeColor || '#FFD700',
            edgeType: nextMap.edgeType || 'smoothstep',
          });
        } else {
          set({ maps: newMaps });
        }
      },
      // Sidebar & Theme Actions
      isSidebarOpen: true,
      sidebarSide: 'right',
      isPinned: false,
      isSidebarHidden: false,
      toggleSidebar: () => {
        set({ isSidebarOpen: !get().isSidebarOpen });
      },
      setSidebarSide: (side) => {
        set({ sidebarSide: side });
      },
      setTheme: (theme) => {
        const { currentMapId, maps, nodes, edges, customThemeColor } = get();
        const oldTheme = get().theme;
        const currentMap = maps.find(m => m.id === currentMapId);
        
        let customNodeColors = currentMap?.customNodeColors || {};
        let customEdgeColors = currentMap?.customEdgeColors || {};

        // 1. If we are LEAVING 'custom', snapshot current manual colors
        if (oldTheme === 'custom') {
          nodes.forEach(n => { if (n.data.color) customNodeColors[n.id] = n.data.color; });
          edges.forEach(e => { if (e.style?.stroke) customEdgeColors[e.id] = e.style.stroke; });
        }

        let newNodes = nodes;
        let newEdges = edges;

        // 2. Determine new state
        if (theme === 'custom') {
          // Restore from snapshot
          newNodes = nodes.map(n => ({ ...n, data: { ...n.data, color: customNodeColors[n.id] || customThemeColor } }));
          newEdges = edges.map(e => ({ ...e, style: { ...e.style, stroke: customEdgeColors[e.id] || customThemeColor } }));
        } else {
          // Apply global theme color
          const color = THEME_CONFIG[theme];
          if (color) {
            newNodes = nodes.map(n => ({ ...n, data: { ...n.data, color } }));
            newEdges = edges.map(e => ({ ...e, style: { ...e.style, stroke: color } }));
          }
        }

        const newMaps = maps.map(m => 
          m.id === currentMapId 
            ? { ...m, theme, nodes: newNodes, edges: newEdges, customNodeColors, customEdgeColors, lastModified: Date.now() } 
            : m
        );
        
        set({ 
          theme,
          nodes: newNodes,
          edges: newEdges,
          maps: newMaps
        });
      },
      setCustomThemeColor: (color) => {
        const { currentMapId, maps, theme } = get();
        if (theme !== 'custom') return;
        
        const newNodes = get().nodes.map(n => ({ ...n, data: { ...n.data, color } }));
        const newEdges = get().edges.map(e => ({ ...e, style: { ...e.style, stroke: color } }));

        const newMaps = maps.map(m => 
          m.id === currentMapId ? { ...m, customThemeColor: color, nodes: newNodes, edges: newEdges, lastModified: Date.now() } : m
        );

        set({
          customThemeColor: color,
          nodes: newNodes,
          edges: newEdges,
          maps: newMaps
        });
      },
      setEdgeType: (type) => {
        const { currentMapId, maps } = get();
        const newEdges = get().edges.map(e => ({ ...e, type }));
        const newMaps = maps.map(m => 
          m.id === currentMapId ? { ...m, edgeType: type, edges: newEdges, lastModified: Date.now() } : m
        );
        set({ 
          edgeType: type,
          edges: newEdges,
          maps: newMaps,
          unexportedChanges: true 
        });
      },
      togglePin: () => {
        set({ isPinned: !get().isPinned });
      },
      setSidebarHidden: (hidden) => {
        set({ isSidebarHidden: hidden });
      },
      // Node Management Actions
      deleteNode: (nodeId) => {
        const { currentMapId, maps } = get();
        const newNodes = get().nodes.filter((node) => node.id !== nodeId);
        const newEdges = get().edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId);
        const newMaps = maps.map(m => 
          m.id === currentMapId ? { ...m, nodes: newNodes, edges: newEdges, lastModified: Date.now() } : m
        );
        set({
          nodes: newNodes,
          edges: newEdges,
          maps: newMaps,
          unexportedChanges: true,
        });
      },
      deleteEdge: (edgeId) => {
        const { currentMapId, maps } = get();
        const newEdges = get().edges.filter((edge) => edge.id !== edgeId);
        const newMaps = maps.map(m => 
          m.id === currentMapId ? { ...m, edges: newEdges, lastModified: Date.now() } : m
        );
        set({
          edges: newEdges,
          maps: newMaps,
          unexportedChanges: true,
        });
      },
      updateNodeColor: (nodeIds, color) => {
        const { currentMapId, maps } = get();
        const newNodes = get().nodes.map((node) => {
          if (nodeIds.includes(node.id)) {
            return { ...node, data: { ...node.data, color } };
          }
          return node;
        });
        const newMaps = maps.map(m => 
          m.id === currentMapId ? { ...m, nodes: newNodes, lastModified: Date.now() } : m
        );
        set({
          nodes: newNodes,
          maps: newMaps,
          unexportedChanges: true,
        });
      },
      updateEdgeColor: (edgeIds, color) => {
        const { currentMapId, maps } = get();
        const newEdges = get().edges.map((edge) => {
          if (edgeIds.includes(edge.id)) {
            return { ...edge, style: { ...edge.style, stroke: color } };
          }
          return edge;
        });
        const newMaps = maps.map(m => 
          m.id === currentMapId ? { ...m, edges: newEdges, lastModified: Date.now() } : m
        );
        set({
          edges: newEdges,
          maps: newMaps,
          unexportedChanges: true,
        });
      },
    }),
    {
      name: 'mindpuke-v1',
      storage: createJSONStorage(() => ({
        getItem: (name) => localStorage.getItem(`${name}-${activeUserId}`),
        setItem: (name, value) => {
          localStorage.setItem(`${name}-${activeUserId}`, value);
        },
        removeItem: (name) => localStorage.removeItem(`${name}-${activeUserId}`),
      })),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        
        // Migration Logic: If maps is empty but nodes exist, move nodes to maps
        if (state.maps.length === 0 && state.nodes.length > 0) {
          const firstMap: MapData = {
            id: crypto.randomUUID(),
            name: 'My First Journey',
            nodes: state.nodes,
            edges: state.edges,
            theme: state.theme || 'royal',
            customThemeColor: state.customThemeColor || '#FFD700',
            edgeType: state.edgeType || 'smoothstep',
            createdAt: Date.now(),
            lastModified: Date.now(),
          };
          state.maps = [firstMap];
          state.currentMapId = firstMap.id;
          state.theme = firstMap.theme;
          state.customThemeColor = firstMap.customThemeColor || '#FFD700';
          state.edgeType = firstMap.edgeType;
        } else if (state.maps.length === 0) {
          // Absolute empty state
          state.createMap('My First Journey');
        } else if (!state.currentMapId || !state.maps.find(m => m.id === state.currentMapId)) {
          // Ensure currentMapId is valid
          const first = state.maps[0];
          state.currentMapId = first.id;
          state.nodes = first.nodes;
          state.edges = first.edges;
          state.theme = first.theme;
          state.edgeType = first.edgeType || 'smoothstep';
        } else {
          // Re-sync active nodes/edges/theme from maps to be safe
          const active = state.maps.find(m => m.id === state.currentMapId);
          if (active) {
            state.nodes = active.nodes;
            state.edges = active.edges;
            state.theme = active.theme;
            state.edgeType = active.edgeType || 'smoothstep';
          }
        }
      }
    }
  )
);

export default useStore;
