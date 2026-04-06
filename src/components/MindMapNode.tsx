import { useEffect, useRef } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Plus } from 'lucide-react';
import useStore from '../store/useStore';

export default function MindMapNode({ id, data, selected }: NodeProps) {
  const addChildNode = useStore((state) => state.addChildNode);
  const updateNodeLabel = useStore((state) => state.updateNodeLabel);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (data.autoFocus && inputRef.current) {
      inputRef.current.focus();
      // Only auto-focus once on creation
      // Note: In strict mode, useEffect might run twice, but focus is idempotent.
    }
  }, [data.autoFocus]);

  return (
    <div className={`flex items-center gap-2 bg-[#1a1a1a] border rounded-lg p-2 min-w-[150px] transition-all duration-200 ${selected ? 'border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'border-zinc-800 shadow-lg'}`}>
      <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-gray-500 border-none" />
      
      <input
        ref={inputRef}
        value={data.label as string}
        onChange={(e) => updateNodeLabel(id, e.target.value)}
        className="bg-transparent border-none outline-none text-white font-medium text-sm w-full"
        placeholder="New Thought"
      />
      
      <button
        onClick={() => addChildNode(id)}
        className="flex items-center justify-center p-1 rounded-full hover:bg-[#333] transition-colors focus:outline-none"
        title="Add child node"
      >
        <Plus className="w-4 h-4 text-purple-400 font-bold" />
      </button>

      <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-purple-500 border-none" />
    </div>
  );
}
