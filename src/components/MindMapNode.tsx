import { useEffect, useRef } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Plus } from 'lucide-react';
import useStore from '../store/useStore';

export default function MindMapNode({ id, data, selected }: NodeProps) {
  const addChildNode = useStore((state) => state.addChildNode);
  const updateNodeLabel = useStore((state) => state.updateNodeLabel);
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

  const borderColor = data.color || (selected ? '#FFD700' : '#27272a');
  const shadowColor = data.color ? `${data.color}40` : 'rgba(255,215,0,0.4)';

  return (
    <div 
      className="flex items-start gap-2 bg-[#1a1a1a] border rounded-xl p-3 min-w-[180px] transition-all duration-300 group"
      style={{ 
        borderColor: borderColor as any,
        boxShadow: selected ? `0 0 20px ${shadowColor}` : '0 10px 15px -3px rgb(0 0 0 / 0.3)'
      }}
    >
      {/* Target Handles */}
      <Handle type="target" position={Position.Left} className="w-3 h-3 !bg-zinc-500 border-2 border-[#1a1a1a] hover:!bg-zinc-400 transition-colors" />
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-zinc-500 border-2 border-[#1a1a1a] hover:!bg-zinc-400 transition-colors" />
      
      <div className="flex-1 flex flex-col justify-center min-h-[24px]">
        <textarea
          ref={textareaRef}
          value={data.label as string}
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

      {/* Source Handles */}
      <Handle type="source" position={Position.Right} className="w-3 h-3 !bg-purple-500 border-2 border-[#1a1a1a] hover:!bg-purple-400 transition-colors" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-purple-500 border-2 border-[#1a1a1a] hover:!bg-purple-400 transition-colors" />
    </div>
  );
}
