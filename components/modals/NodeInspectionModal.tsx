import { MapPin, Home, Briefcase, GraduationCap, ShoppingCart, Music, Plane, DoorOpen, Footprints, Check, AlertTriangle, X } from 'lucide-react';

interface NodeInspectionModalProps {
  node: any;
  onClose: () => void;
  onTravel: () => void;
  canTravel: boolean;
  travelCost: number;
}

export default function NodeInspectionModal({ node, onClose, onTravel, canTravel, travelCost }: NodeInspectionModalProps) {
  let title = node.label || 'Unknown Location';
  let desc = 'A normal location on the map.';
  let typeLabel = 'Standard Node';
  let effect = null;
  let icon = <MapPin size={32} className="text-zinc-500" />;
  let color = "text-zinc-400";

  if (node.type === 'kingdom_hall') {
    title = 'Kingdom Hall';
    typeLabel = 'Sanctuary';
    desc = 'The center of spiritual safety and the ultimate destination for the group.';
    effect = { type: 'positive', text: '+5 Faith Points when secured.' };
    icon = <Home size={32} className="text-amber-500" />;
    color = "text-amber-500";
  } else if (node.type === 'territory') {
    typeLabel = 'Territory';
    desc = 'An unassigned territory ripe for the harvest.';
    effect = { type: 'positive', text: '+2 Faith Points when secured.' };
    icon = <MapPin size={32} className="text-indigo-500" />;
    color = "text-indigo-500";
  } else if (node.type === 'trap') {
    typeLabel = 'Distraction';
    color = "text-red-500";
    if (node.id === 'trap_work') {
      title = 'Workplace';
      desc = 'Mandatory overtime consumes your energy.';
      effect = { type: 'negative', text: 'Cost 2 AP to leave this node.' };
      icon = <Briefcase size={32} className="text-red-500" />;
    } else if (node.id === 'trap_school') {
      title = 'University';
      desc = 'Intense studies require focus.';
      effect = { type: 'negative', text: 'Cost 2 AP to leave this node.' };
      icon = <GraduationCap size={32} className="text-red-500" />;
    } else if (node.id === 'trap_market') {
      title = 'Supermarket';
      desc = 'The cares of daily life.';
      effect = { type: 'negative', text: 'Cost 2 AP to leave this node.' };
      icon = <ShoppingCart size={32} className="text-red-500" />;
    } else if (node.id === 'trap_recreation') {
      title = 'Recreation';
      desc = 'Entertainment can be refreshing but distracting.';
      effect = { type: 'negative', text: 'Leaving drains 2 Faith Points from progress.' };
      icon = <Music size={32} className="text-amber-500" />;
      color = "text-amber-500";
    } else if (node.id === 'trap_vacation') {
      title = 'Vacation';
      desc = 'A time to relax, but re-engaging takes effort.';
      effect = { type: 'negative', text: 'Next Territory secure costs +1 AP.' };
      icon = <Plane size={32} className="text-blue-400" />;
      color = "text-blue-400";
    }
  } else if (node.type === 'inner_room') {
    title = 'Inner Room';
    typeLabel = 'Refuge';
    desc = 'A safe house during the Great Tribulation.';
    effect = { type: 'positive', text: 'Safe from most trials. Limited capacity.' };
    icon = <DoorOpen size={32} className="text-purple-500" />;
    color = "text-purple-500";
  } else if (node.type === 'start') {
    typeLabel = 'Start Zone';
    desc = 'Where your journey begins.';
    icon = <Footprints size={32} className="text-zinc-500" />;
  }

  return (
    <div className="absolute inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-8 animate-in fade-in zoom-in duration-200" onClick={onClose}>
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 shadow-2xl max-w-sm w-full relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X size={20} /></button>
        
        <div className="flex flex-col items-center text-center mb-6">
           <div className={`p-4 rounded-full bg-zinc-800 mb-4 ${color} shadow-lg ring-1 ring-white/10`}>{icon}</div>
           <div className={`text-xs font-bold uppercase tracking-widest mb-1 ${color}`}>{typeLabel}</div>
           <h2 className="text-2xl font-black text-white mb-2">{title}</h2>
           <p className="text-sm text-zinc-400 leading-relaxed">{desc}</p>
        </div>

        {effect && (
          <div className={`mb-6 p-3 rounded-lg border flex items-start gap-3 text-left ${effect.type === 'positive' ? 'bg-emerald-900/20 border-emerald-500/50' : 'bg-red-900/20 border-red-500/50'}`}>
             {effect.type === 'positive' ? <Check size={16} className="text-emerald-500 mt-0.5" /> : <AlertTriangle size={16} className="text-red-500 mt-0.5" />}
             <div>
               <div className={`text-xs font-bold uppercase ${effect.type === 'positive' ? 'text-emerald-400' : 'text-red-400'}`}>Effect</div>
               <div className="text-xs text-zinc-300">{effect.text}</div>
             </div>
          </div>
        )}

        {canTravel ? (
          <button onClick={onTravel} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2">
            <Footprints size={18} /> Travel Here ({travelCost} AP)
          </button>
        ) : (
          <div className="w-full py-3 bg-zinc-800 text-zinc-500 font-bold rounded-xl text-center text-sm">
            {node.type === 'kingdom_hall' ? 'Too Far to Travel' : 'Too Far / Not Enough AP'}
          </div>
        )}
      </div>
    </div>
  );
}

