
import React, { useState } from 'react';
import { SongItem, AppState } from '../types';
import { exportToCSV, parseCSV } from '../services/logic';
import { X, Trash2, Edit2, Plus, Download, Upload, RotateCcw } from 'lucide-react';
import { INITIAL_DATA } from '../constants';

interface LibraryModalProps {
  state: AppState;
  onClose: () => void;
  onUpdateState: (newState: AppState) => void;
}

export const LibraryModal: React.FC<LibraryModalProps> = ({ state, onClose, onUpdateState }) => {
  const [editingSong, setEditingSong] = useState<Partial<SongItem> | null>(null);

  const allSongs = [...state.columns.set1, ...state.columns.rep, ...state.columns.set2]
    .sort((a, b) => b.createdAt - a.createdAt);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSong?.title) return;

    const newState = { ...state };
    if (editingSong.uid) {
      (['set1', 'rep', 'set2'] as const).forEach(c => {
        newState.columns[c] = newState.columns[c].map(s => s.uid === editingSong.uid ? { ...s, ...editingSong } as SongItem : s);
      });
    } else {
      const newSong = { 
        ...editingSong, 
        uid: Math.random().toString(36).substr(2, 9), 
        createdAt: Date.now(),
        key: editingSong.key || '',
        tempo: editingSong.tempo || '',
        notes: editingSong.notes || '',
        cues: editingSong.cues || '',
      } as SongItem;
      newState.columns.rep = [newSong, ...newState.columns.rep];
    }
    onUpdateState(newState);
    setEditingSong(null);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-2 sm:p-6 backdrop-blur-sm">
      <div className="flex h-full max-h-[90vh] sm:max-h-[850px] w-full max-w-6xl flex-col overflow-hidden rounded-2xl sm:rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-4">
            <h2 className="text-lg sm:text-2xl font-black uppercase tracking-tight text-white">Bibliotek</h2>
            <span className="hidden xs:inline rounded-full bg-slate-800 px-3 py-1 text-[10px] font-bold text-slate-400 border border-slate-700">{allSongs.length} Sange</span>
          </div>
          <button onClick={onClose} className="rounded-full bg-slate-800 p-2 text-slate-400 hover:text-white transition-all"><X size={20}/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6 custom-scrollbar">
          {/* Main Actions */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 bg-slate-950/40 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-800">
            <button onClick={() => setEditingSong({ title: '', key: '', tempo: '', notes: '', cues: '' })} className="flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 sm:px-6 py-2 sm:py-3 text-[10px] sm:text-xs font-black uppercase tracking-wider text-white hover:bg-blue-500 transition-all">
              <Plus size={16}/> Ny Sang
            </button>
            <div className="flex flex-1 sm:flex-none gap-2">
              <button onClick={() => exportToCSV(state)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-slate-800 px-3 sm:px-4 py-2 sm:py-3 text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-200 hover:bg-slate-700 transition-all">
                <Download size={16}/> Eksport
              </button>
              <label className="flex-1 sm:flex-none flex items-center justify-center cursor-pointer gap-2 rounded-xl bg-slate-800 px-3 sm:px-4 py-2 sm:py-3 text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-200 hover:bg-slate-700 transition-all">
                <Upload size={16}/> Import
                <input type="file" className="hidden" accept=".csv" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const r = new FileReader();
                  r.onload = (evt) => {
                    const { songs, colMap, lockMap } = parseCSV(evt.target?.result as string);
                    const ns = { ...state };
                    songs.forEach(s => { ns.columns[colMap[s.uid] || 'rep'].push(s); if(lockMap[s.uid]) ns.locks.items[s.uid]=true; });
                    onUpdateState(ns);
                  };
                  r.readAsText(file);
                }}/>
              </label>
            </div>
            <button onClick={() => confirm('Gendan Jazz-demo data?') && onUpdateState(INITIAL_DATA)} className="sm:ml-auto flex items-center gap-2 rounded-xl bg-red-900/20 px-3 sm:px-4 py-2 sm:py-3 text-[10px] sm:text-xs font-black uppercase tracking-wider text-red-400 hover:bg-red-900/30 transition-all">
              <RotateCcw size={16}/> Gendan Demo
            </button>
          </div>

          {editingSong && (
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl animate-in fade-in slide-in-from-top-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-blue-400">{editingSong.uid ? 'Redigér Sang' : 'Opret Ny Sang'}</h3>
                <button onClick={() => setEditingSong(null)} className="text-slate-500 hover:text-white"><X size={18}/></button>
              </div>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Titel</label>
                    <input required placeholder="Titel" className="w-full rounded-xl bg-slate-950 p-3 sm:p-4 text-sm text-white border border-slate-800 outline-none" value={editingSong.title} onChange={e => setEditingSong({...editingSong, title: e.target.value})}/>
                  </div>
                  <div>
                    <label className="block text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Toneart</label>
                    <input placeholder="Eks. Cm" className="w-full rounded-xl bg-slate-950 p-3 sm:p-4 text-sm text-white border border-slate-800 outline-none" value={editingSong.key} onChange={e => setEditingSong({...editingSong, key: e.target.value})}/>
                  </div>
                  <div>
                    <label className="block text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">BPM</label>
                    <input placeholder="120" className="w-full rounded-xl bg-slate-950 p-3 sm:p-4 text-sm text-white border border-slate-800 outline-none" value={editingSong.tempo} onChange={e => setEditingSong({...editingSong, tempo: e.target.value})}/>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <textarea placeholder="Form (Opsætning)" className="w-full rounded-xl bg-slate-950 p-3 sm:p-4 text-sm text-white border border-slate-800 outline-none min-h-[80px]" value={editingSong.notes} onChange={e => setEditingSong({...editingSong, notes: e.target.value})}/>
                  <textarea placeholder="Cues (Bemærkninger)" className="w-full rounded-xl bg-slate-950 p-3 sm:p-4 text-sm text-white border border-slate-800 outline-none min-h-[80px] italic" value={editingSong.cues} onChange={e => setEditingSong({...editingSong, cues: e.target.value})}/>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setEditingSong(null)} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500">Annuller</button>
                  <button type="submit" className="rounded-xl bg-blue-600 px-6 sm:px-10 py-2 sm:py-3 text-[10px] sm:text-xs font-black uppercase tracking-widest text-white shadow-lg">Gem</button>
                </div>
              </form>
            </div>
          )}

          <div className="space-y-2">
             <div className="hidden sm:grid grid-cols-12 px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 border-b border-slate-800">
               <div className="col-span-4">Titel</div>
               <div className="col-span-1">Tone</div>
               <div className="col-span-1">BPM</div>
               <div className="col-span-4">Form / Bemærkninger</div>
               <div className="col-span-2 text-right pr-2">Handlinger</div>
             </div>
             
             <div className="divide-y divide-slate-800/50 rounded-xl sm:rounded-2xl border border-slate-800 bg-slate-950/30">
              {allSongs.length === 0 ? (
                <div className="p-10 sm:p-20 text-center text-slate-600 font-bold uppercase tracking-widest text-[10px]">Ingen sange fundet</div>
              ) : allSongs.map(s => (
                <div key={s.uid} className="flex flex-col sm:grid sm:grid-cols-12 items-start sm:items-center px-4 sm:px-6 py-4 hover:bg-slate-800/20 transition-all group gap-2 sm:gap-0">
                  <div className="sm:col-span-4 w-full flex justify-between items-center">
                    <div className="font-black text-slate-100 group-hover:text-blue-400 transition-colors text-sm sm:text-base">{s.title}</div>
                    <div className="flex sm:hidden gap-1">
                      <button onClick={() => setEditingSong(s)} className="p-2 text-slate-500"><Edit2 size={14}/></button>
                      <button onClick={() => { if(confirm(`Slet "${s.title}"?`)) { 
                        const ns = { ...state };
                        (['set1','rep','set2'] as const).forEach(c => ns.columns[c] = ns.columns[c].filter(x => x.uid !== s.uid));
                        onUpdateState(ns);
                      }}} className="p-2 text-slate-700"><Trash2 size={14}/></button>
                    </div>
                  </div>
                  <div className="sm:col-span-1 flex gap-3 sm:block">
                    <span className="sm:hidden text-[8px] font-bold uppercase text-slate-600">Tone:</span>
                    <div className="mono text-blue-400 font-bold text-xs sm:text-sm">{s.key || '-'}</div>
                  </div>
                  <div className="sm:col-span-1 flex gap-3 sm:block">
                    <span className="sm:hidden text-[8px] font-bold uppercase text-slate-600">BPM:</span>
                    <div className="mono text-emerald-400 font-bold text-xs sm:text-sm">{s.tempo || '-'}</div>
                  </div>
                  <div className="sm:col-span-4 text-[10px] sm:text-xs text-slate-500 leading-snug truncate w-full sm:pr-4">
                    {s.notes && <span className="text-slate-400 font-bold uppercase mr-1">[{s.notes}]</span>}
                    {s.cues && <span className="italic">"{s.cues}"</span>}
                  </div>
                  <div className="hidden sm:flex col-span-2 justify-end gap-1">
                    <button onClick={() => setEditingSong(s)} className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-slate-700 transition-all" title="Redigér"><Edit2 size={16}/></button>
                    <button onClick={() => { if(confirm(`Slet "${s.title}"?`)) { 
                      const ns = { ...state };
                      (['set1','rep','set2'] as const).forEach(c => ns.columns[c] = ns.columns[c].filter(x => x.uid !== s.uid));
                      onUpdateState(ns);
                    }}} className="p-2 rounded-lg text-slate-700 hover:text-red-500 hover:bg-red-500/10 transition-all" title="Slet"><Trash2 size={16}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
