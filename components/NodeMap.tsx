import { Briefcase, GraduationCap, ShoppingCart, Music, Plane, Home, DoorOpen } from 'lucide-react';

interface NodeMapProps {
  players: any[];
  nodes: any[];
  connections: any[];
  onNodeClick: (nodeId: string) => void;
  validMoves: string[];
  tableRotation?: number;
}

export default function NodeMap({ players, nodes, connections, onNodeClick, validMoves, tableRotation = 0 }: NodeMapProps) {
  return (
    <div className="absolute inset-0 z-0">
      <svg className="w-full h-full pointer-events-none z-0">
        {connections.map((c: any, i: number) => {
          const sNode = nodes.find((n: any) => n.id === c.start);
          const eNode = nodes.find((n: any) => n.id === c.end);
          if (!sNode || !eNode) return null;
          return <line key={i} x1={`${sNode.x}%`} y1={`${sNode.y}%`} x2={`${eNode.x}%`} y2={`${eNode.y}%`} className="stroke-zinc-600/60 stroke-[0.8]" />;
        })}
      </svg>
      {nodes.map((node: any) => {
        const occupants = players.filter((p: any) => p.nodeId === node.id);
        const isValidMove = validMoves.includes(node.id);
        const isSpecial = node.type === 'kingdom_hall' || node.type === 'territory';
        const isTrap = node.type === 'trap';
        const isInnerRoom = node.type === 'inner_room';
        const isStart = node.type === 'start';
        
        let nodeSize = 'w-1.5 h-1.5';
        let nodeColor = 'bg-zinc-700';
        let iconSize = 8;
        
        if (node.type === 'kingdom_hall') { nodeSize = 'w-18 h-18'; nodeColor = 'bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.5)]'; iconSize = 24; }
        else if (node.type === 'territory') { nodeSize = 'w-9 h-9'; nodeColor = 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]'; iconSize = 16; }
        else if (node.type === 'trap') { nodeSize = 'w-12 h-12'; nodeColor = 'bg-red-900 border border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.6)]'; iconSize = 20; }
        else if (node.type === 'inner_room') { nodeSize = 'w-12 h-12'; nodeColor = 'bg-purple-600 border border-purple-400 shadow-[0_0_15px_rgba(147,51,234,0.6)]'; iconSize = 20; }
        else if (node.type === 'start') { nodeSize = 'w-9 h-9'; nodeColor = isValidMove ? 'bg-zinc-500 border border-white' : 'bg-zinc-800 border border-zinc-600'; iconSize = 16; }
        
        // Trap specific icons
        let TrapIcon = Briefcase;
        if (node.id === 'trap_school') TrapIcon = GraduationCap;
        if (node.id === 'trap_market') TrapIcon = ShoppingCart;
        if (node.id === 'trap_recreation') TrapIcon = Music;
        if (node.id === 'trap_vacation') TrapIcon = Plane;

        const isClickable = isValidMove || isSpecial || isTrap || isInnerRoom || isStart;
        const canInspect = !isValidMove && (isSpecial || isTrap || isInnerRoom || isStart);
        const ringClass = canInspect ? 'ring-1 ring-zinc-500/50' : '';

        const isSpecialNode = isSpecial || isTrap || isInnerRoom || isStart;
        const containerSize = isSpecialNode ? (node.type === 'kingdom_hall' ? 'w-18 h-18' : node.type === 'trap' || node.type === 'inner_room' ? 'w-12 h-12' : 'w-9 h-9') : (isValidMove ? 'w-8 h-8 -m-2' : 'w-4 h-4');
        
        return (
          <div key={node.id} onClick={() => isClickable && onNodeClick(node.id)} className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${isClickable ? 'cursor-pointer' : 'pointer-events-none'} ${isValidMove ? 'scale-125 z-20' : 'z-10'}`} style={{ left: `${node.x}%`, top: `${node.y}%` }}>
            <div className={`${containerSize} absolute flex items-center justify-center`}>
                <div className={`${nodeSize} rounded-full ${nodeColor} ${isValidMove ? 'animate-pulse ring-2 ring-emerald-400' : ringClass} flex items-center justify-center transition-all`}>
                    {node.type === 'kingdom_hall' && <Home size={iconSize} className="text-zinc-900" style={{ transform: `rotate(${-tableRotation}deg)` }} />}
                    {isInnerRoom && <DoorOpen size={iconSize} className="text-white" style={{ transform: `rotate(${-tableRotation}deg)` }} />}
                    {isTrap && <TrapIcon size={iconSize} className="text-white" style={{ transform: `rotate(${-tableRotation}deg)` }} />}
                </div>
            </div>
            {(isSpecial || isStart || isInnerRoom || isTrap) && (
              <div 
                className="absolute top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold text-zinc-400 whitespace-nowrap uppercase tracking-wider bg-zinc-950/80 px-2 py-0.5 rounded pointer-events-none border border-zinc-800 shadow-md"
                style={{ transform: `translateX(-50%) rotate(${-tableRotation}deg)` }}
              >
                {node.label}
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
               {occupants.map((p: any, i: number) => {
                 // For special nodes, position players inside the larger node
                 const isSpecialNode = isSpecial || isTrap || isInnerRoom || isStart;
                 const offsetX = isSpecialNode ? (i % 2 === 0 ? -6 : 6) : (i * 4);
                 const offsetY = isSpecialNode ? (Math.floor(i / 2) * -8) : (i * -4);
                 
                 return (
                   <div 
                     key={p.id} 
                     className="w-4 h-4 rounded-full border border-white text-[6px] font-bold flex items-center justify-center shadow-md absolute transition-all" 
                     style={{ 
                       backgroundColor: p.color, 
                       transform: `translate(${offsetX}px, ${offsetY}px) rotate(${-tableRotation}deg)`, 
                       zIndex: 30 + i 
                     }}
                   >
                     {p.activeCharacters[0]?.name?.charAt(0) || 'P'}
                   </div>
                 );
               })}
            </div>
          </div>
        );
      })}
    </div>
  );
}


