import { useEffect, useRef } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Plus, Minus } from 'lucide-react';
import useStore, { THEME_CONFIG } from '../store/useStore';

export default function MindMapNode({ id, data, selected }: NodeProps) {
  const addChildNode = useStore((state) => state.addChildNode);
  const updateNodeLabel = useStore((state) => state.updateNodeLabel);
  const theme = useStore((state) => state.theme);
  const customThemeColor = useStore((state) => state.customThemeColor);
  const toggleBranch = useStore((state) => state.toggleBranch);
  const hasChildren = useStore((state) => state.edges.some(e => e.source === id));
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [data.label]);

  useEffect(() => {
    if (data.autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [data.autoFocus]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.ctrlKey) {
      // Finish editing on Enter
      e.preventDefault();
      textareaRef.current?.blur();
    }
    // Ctrl + Enter naturally adds a newline in a textarea
  };

  const themeFallback = theme === 'custom' ? customThemeColor : THEME_CONFIG[theme];
  const nodeColor = data.color || themeFallback || '#A855F7';
  const borderColor = nodeColor;
  const shadowColor = `${nodeColor}40`;

  return (
    <div 
      className="relative flex items-start gap-2 bg-[#1a1a1a] border rounded-xl p-3 min-w-[180px] transition-all duration-300 group"
      style={{ 
        borderColor: borderColor as any,
        boxShadow: selected ? `0 0 20px ${shadowColor}` : '0 10px 15px -3px rgb(0 0 0 / 0.3)'
      }}
    >
      {/* Connection Handles (Overlapped Source & Target) */}
      {/* Left */}
      <Handle type="target" position={Position.Left} id="target-left" className="w-3 h-3 !bg-zinc-600 border-2 border-[#1a1a1a] hover:!bg-purple-500 transition-colors z-10" />
      <Handle type="source" position={Position.Left} id="source-left" className="w-3 h-3 !bg-zinc-600 border-2 border-[#1a1a1a] hover:!bg-purple-500 transition-colors z-20" />
      
      {/* Right */}
      <Handle type="target" position={Position.Right} id="target-right" className="w-3 h-3 !bg-zinc-600 border-2 border-[#1a1a1a] hover:!bg-purple-500 transition-colors z-10" />
      <Handle type="source" position={Position.Right} id="source-right" className="w-3 h-3 !bg-zinc-600 border-2 border-[#1a1a1a] hover:!bg-purple-500 transition-colors z-20" />
      
      {/* Top */}
      <Handle type="target" position={Position.Top} id="target-top" className="w-3 h-3 !bg-zinc-600 border-2 border-[#1a1a1a] hover:!bg-purple-500 transition-colors z-10" />
      <Handle type="source" position={Position.Top} id="source-top" className="w-3 h-3 !bg-zinc-600 border-2 border-[#1a1a1a] hover:!bg-purple-500 transition-colors z-20" />
      
      {/* Bottom */}
      <Handle type="target" position={Position.Bottom} id="target-bottom" className="w-3 h-3 !bg-zinc-600 border-2 border-[#1a1a1a] hover:!bg-purple-500 transition-colors z-10" />
      <Handle type="source" position={Position.Bottom} id="source-bottom" className="w-3 h-3 !bg-zinc-600 border-2 border-[#1a1a1a] hover:!bg-purple-500 transition-colors z-20" />
      
      <div className="flex-1 flex flex-col justify-center min-h-[24px]">
        <textarea
          ref={textareaRef}
          value={data.label as string}
          onFocus={() => useStore.getState().pushHistory()}
          onChange={(e) => {
            updateNodeLabel(id, e.target.value);
            adjustHeight();
          }}
          onKeyDown={onKeyDown}
          className="bg-transparent border-none outline-none text-white font-medium text-sm w-full resize-none overflow-hidden leading-relaxed placeholder:text-zinc-600"
          placeholder="New Thought"
          rows={1}
        />
      </div>
      
      <button
        onClick={() => addChildNode(id)}
        className="flex items-center justify-center p-1.5 rounded-full bg-zinc-800/50 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all focus:outline-none opacity-0 group-hover:opacity-100 mt-0.5"
        title="Add child node"
      >
        <Plus className="w-3.5 h-3.5 font-bold" />
      </button>

      {hasChildren && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleBranch(id);
          }}
          className={`absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 rounded-full border transition-all duration-300 z-30 shadow-[0_0_10px_rgba(0,0,0,0.5)] ${
            data.isCollapsed 
              ? 'bg-gradient-to-br from-red-500 to-amber-500 border-red-400/50 text-white scale-110 shadow-red-500/20' 
              : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 hover:scale-110 opacity-0 group-hover:opacity-100'
          }`}
          title={data.isCollapsed ? "Expand branch" : "Collapse branch"}
        >
          {data.isCollapsed ? <Plus className="w-3 h-3 font-bold" /> : <Minus className="w-3 h-3" />}
        </button>
      )}
    </div>
  );
}
