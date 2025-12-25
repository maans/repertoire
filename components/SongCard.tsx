
import React from 'react';
import { SongItem, ColumnType } from '../types';
import { Star, GripVertical } from 'lucide-react';

interface SongCardProps {
  song: SongItem;
  index: number;
  colType: ColumnType;
  isLocked: boolean;
  onToggleLock: (uid: string) => void;
  onPointerDown: (e: React.PointerEvent, song: SongItem, fromCol: ColumnType) => void;
}

export const SongCard: React.FC<SongCardProps> = ({ song, index, colType, isLocked, onToggleLock, onPointerDown }) => {
  return (
    <div 
      className={`group relative select-none rounded-2xl border transition-all duration-300 ${
        isLocked 
          ? 'border-amber-500/40 bg-amber-500/5 shadow-lg shadow-amber-500/5' 
          : 'border-white/5 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]'
      }`}
    >
      <div className="flex items-center gap-3 p-3 sm:p-3.5">
        {/* Drag handle eller Nummer */}
        <div 
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-black transition-all ${
            isLocked 
              ? 'bg-amber-500 text-amber-950 shadow-lg shadow-amber-500/20' 
              : 'bg-white/5 text-slate-500 group-hover:bg-white/10 group-hover:text-slate-300'
          } ${!isLocked ? 'cursor-grab active:cursor-grabbing' : ''}`}
          onPointerDown={!isLocked ? (e) => onPointerDown(e, song, colType) : undefined}
        >
          {!isLocked ? <GripVertical size={20} /> : (index + 1)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <h4 className="truncate text-base font-bold tracking-tight text-slate-100 group-hover:text-white transition-colors">
              {song.title}
            </h4>
            <div className="flex shrink-0 items-center gap-2">
              <div className="flex items-center gap-1 rounded-lg bg-black/40 px-2 py-1 text-[11px] font-black text-blue-400 mono border border-white/5">
                {song.key || '?'}
              </div>
              <div className="hidden xs:flex items-center gap-1 rounded-lg bg-black/40 px-2 py-1 text-[11px] font-black text-emerald-400 mono border border-white/5">
                {song.tempo || '-'}
              </div>
              <button 
                onPointerDown={(e) => { e.stopPropagation(); onToggleLock(song.uid); }}
                className={`ml-1 transition-all active:scale-150 p-1 rounded-full ${isLocked ? 'text-amber-500 hover:bg-amber-500/10' : 'text-slate-600 hover:text-amber-400 hover:bg-white/5'}`}
              >
                <Star size={20} fill={isLocked ? "currentColor" : "none"} strokeWidth={isLocked ? 0 : 2} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
