import { useReactFlow } from '@xyflow/react';
import { 
  Trash2, 
  Copy, 
  Plus, 
  Maximize, 
  Check 
} from 'lucide-react';
import useStore from '../store/useStore';

interface ContextMenuProps {
  id?: string;
  type: 'node' | 'pane' | 'edge';
  x: number;
  y: number;
  data?: any;
  onClose: () => void;
}

export default function ContextMenu({ id, type, x, y, data, onClose }: ContextMenuProps) {
  const { screenToFlowPosition, fitView } = useReactFlow();
  const { nodes, edges, addNode, deleteNode, deleteEdge, updateNodeColor, updateEdgeColor } = useStore();

  const colors = [
    { name: 'Purple', value: '#A855F7' },
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Green', value: '#10B981' },
    { name: 'Zinc', value: '#71717A' },
    { name: 'White', value: '#FFFFFF' },
    { name: 'Gold', value: '#FFD700' },
  ];

  const selectedNodeIds = nodes.filter((n) => n.selected).map((n) => n.id);
  const targetNodeIds = selectedNodeIds.length > 0 && id && selectedNodeIds.includes(id) 
    ? selectedNodeIds 
    : [id].filter(Boolean) as string[];

  const selectedEdgeIds = edges.filter((e) => e.selected).map((e) => e.id);
  const targetEdgeIds = selectedEdgeIds.length > 0 && id && selectedEdgeIds.includes(id)
    ? selectedEdgeIds
    : [id].filter(Boolean) as string[];

  const handleCopy = () => {
    if (data?.label) {
      navigator.clipboard.writeText(data.label);
    }
    onClose();
  };

  const handleDelete = () => {
    if (id) deleteNode(id);
    onClose();
  };

  const handleDeleteEdge = () => {
    if (id) deleteEdge(id);
    onClose();
  };

  const handleNewThought = () => {
    const position = screenToFlowPosition({ x, y });
    addNode(position.x, position.y);
    onClose();
  };

  const handleCenterView = () => {
    fitView({ duration: 800 });
    onClose();
  };

  return (
    <div 
      className="fixed z-[1000] bg-[#0f0f0f]/95 backdrop-blur-md border border-zinc-800 shadow-2xl rounded-xl p-1.5 min-w-[180px] animate-in fade-in zoom-in duration-150"
      style={{ top: y, left: x }}
      onClick={(e) => e.stopPropagation()}
    >
      {type === 'node' ? (
        <>
          <div className="px-2 py-1 mb-1 border-b border-zinc-800/50">
            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Node Actions</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-1.5 p-2 mb-1 max-w-[200px]">
            {colors.map((c) => (
              <button
                key={c.value}
                onClick={() => {
                  updateNodeColor(targetNodeIds, c.value);
                  onClose();
                }}
                className="w-5 h-5 rounded-full border border-white/10 hover:scale-110 transition-transform relative group"
                style={{ backgroundColor: c.value }}
                title={c.name}
              >
                {data?.color === c.value && (
                  <Check className="w-3 h-3 text-white absolute inset-0 m-auto" />
                )}
              </button>
            ))}
          </div>

          <button
            onClick={handleCopy}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-300 hover:bg-purple-500/10 hover:text-purple-400 rounded-lg transition-colors text-left"
          >
            <Copy className="w-4 h-4" />
            <span>Copy Text</span>
          </button>
          
          <button
            onClick={handleDelete}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400/80 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-colors text-left"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Node</span>
          </button>
        </>
      ) : type === 'edge' ? (
        <>
          <div className="px-2 py-1 mb-1 border-b border-zinc-800/50">
            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Connection Actions</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 p-2 mb-1 max-w-[200px]">
            {colors.map((c) => (
              <button
                key={c.value}
                onClick={() => {
                  updateEdgeColor(targetEdgeIds, c.value);
                  onClose();
                }}
                className="w-5 h-5 rounded-full border border-white/10 hover:scale-110 transition-transform relative group"
                style={{ backgroundColor: c.value }}
                title={c.name}
              >
                {edges.find(e => e.id === id)?.style?.stroke === c.value && (
                  <Check className="w-3 h-3 text-white absolute inset-0 m-auto" />
                )}
              </button>
            ))}
          </div>

          <button
            onClick={handleDeleteEdge}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400/80 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-colors text-left"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Connection</span>
          </button>
        </>
      ) : (
        <>
          <div className="px-2 py-1 mb-1 border-b border-zinc-800/50">
            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Map Actions</span>
          </div>
          <button
            onClick={handleNewThought}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-300 hover:bg-purple-500/10 hover:text-purple-400 rounded-lg transition-colors text-left"
          >
            <Plus className="w-4 h-4" />
            <span>New Thought</span>
          </button>
          <button
            onClick={handleCenterView}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-300 hover:bg-purple-500/10 hover:text-purple-400 rounded-lg transition-colors text-left"
          >
            <Maximize className="w-4 h-4" />
            <span>Center View</span>
          </button>
        </>
      )}
    </div>
  );
}
