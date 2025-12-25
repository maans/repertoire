
import React, { useState, useEffect } from 'react';
import { AppState, SongItem, ColumnType, SortOrder, ColumnSort } from './types';
import { INITIAL_DATA } from './constants';
import { SongCard } from './components/SongCard';
import { LibraryModal } from './components/LibraryModal';
import { HelpModal } from './components/HelpModal';
import { mixSets, splitItems, sortUnlocked } from './services/logic';
import { Music, ListMusic, Printer, Wand2, Star, LayoutGrid, HelpCircle } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem('setlist_pro_state_v3') || localStorage.getItem('setlist_pro_state');
      return saved ? JSON.parse(saved) : INITIAL_DATA;
    } catch (e) {
      return INITIAL_DATA;
    }
  });
  
  const [showLibrary, setShowLibrary] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [dragInfo, setDragInfo] = useState<{
    song: SongItem;
    fromCol: ColumnType;
    x: number;
    y: number;
    hoverCol: ColumnType | null;
    hoverIndex: number | null;
  } | null>(null);

  const [sorts, setSorts] = useState<Record<ColumnType, ColumnSort>>({
    set1: { field: null, order: SortOrder.NEUTRAL },
    rep: { field: null, order: SortOrder.NEUTRAL },
    set2: { field: null, order: SortOrder.NEUTRAL },
  });

  useEffect(() => {
    localStorage.setItem('setlist_pro_state_v3', JSON.stringify(state));
  }, [state]);

  const handleMix = () => setState(prev => mixSets(prev));

  const handlePointerDown = (e: React.PointerEvent, song: SongItem, fromCol: ColumnType) => {
    const startX = e.clientX;
    const startY = e.clientY;
    let isDraggingStarted = false;

    const onPointerMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      if (!isDraggingStarted && (Math.abs(dx) > 10 || Math.abs(dy) > 10)) {
        isDraggingStarted = true;
      }

      if (isDraggingStarted) {
        const elementsUnder = document.elementsFromPoint(moveEvent.clientX, moveEvent.clientY);
        const colEl = elementsUnder.find(el => el.hasAttribute('data-col'));
        const hoverCol = colEl ? colEl.getAttribute('data-col') as ColumnType : null;
        
        let hoverIndex: number | null = null;
        if (hoverCol) {
          const songEls = Array.from(document.querySelectorAll(`[data-col-items="${hoverCol}"] > [data-song-idx]`));
          const targetIdx = songEls.findIndex(el => {
            const rect = el.getBoundingClientRect();
            return moveEvent.clientY < rect.top + rect.height / 2;
          });
          hoverIndex = targetIdx === -1 ? songEls.length : targetIdx;
        }

        setDragInfo({
          song, fromCol, x: moveEvent.clientX, y: moveEvent.clientY, hoverCol, hoverIndex
        });
      }
    };

    const onPointerUp = () => {
      setDragInfo(current => {
        if (current && current.hoverCol) {
          setState(prev => {
            const newState = JSON.parse(newStateState(prev)) as AppState;
            function newStateState(p: AppState) { return JSON.stringify(p); }
            newState.columns[current.fromCol] = newState.columns[current.fromCol].filter(s => s.uid !== current.song.uid);
            const targetCol = current.hoverCol!;
            const targetIdx = current.hoverIndex ?? newState.columns[targetCol].length;
            newState.columns[targetCol].splice(targetIdx, 0, current.song);
            return newState;
          });
        }
        return null;
      });
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const renderColumn = (col: ColumnType) => {
    const items = state.columns[col];
    const isRepEmpty = col === 'rep' && items.length === 0;
    const isHoveringThisCol = dragInfo?.hoverCol === col;
    
    if (isRepEmpty && !isHoveringThisCol) return null;

    const isLocked = state.locks.col[col];
    const { locked, unlocked } = splitItems(items, state.locks.items);
    const sorted = sortUnlocked(unlocked, sorts[col]);
    let displayList = [...locked, ...sorted];

    if (dragInfo?.fromCol === col) {
      displayList = displayList.filter(s => s.uid !== dragInfo.song.uid);
    }

    const labels = { set1: 'Sæt 1', rep: 'Repertoire', set2: 'Sæt 2' };

    return (
      <div 
        data-col={col}
        className={`flex h-full w-[85vw] md:w-[45vw] lg:w-[380px] flex-col rounded-[2.5rem] transition-all duration-500 relative shrink-0 glass-panel ${
          isHoveringThisCol && !isLocked ? 'ring-2 ring-blue-500/50 bg-blue-500/10' : ''
        }`}
      >
        <div className="flex items-center justify-between p-6 shrink-0">
          <div className="flex items-center gap-3">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-100/80 text-shadow-sm">{labels[col]}</h3>
            <span className="rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-black text-slate-200 border border-white/20">{items.length}</span>
          </div>
          <div className="flex items-center gap-1">
             {!isLocked && displayList.length > 1 && (
              <div className="flex gap-1 mr-2">
                {['key', 'tempo'].map((f) => (
                  <button 
                    key={f}
                    onClick={() => {
                      setSorts(prev => {
                        const cur = prev[col];
                        const next = cur.field === f ? (cur.order === 'asc' ? 'desc' : 'neutral') : 'asc';
                        return { ...prev, [col]: { field: f as any, order: next as any } };
                      });
                    }}
                    className={`rounded-lg px-2.5 py-1.5 text-[9px] font-black uppercase transition-all border ${
                      sorts[col].field === f ? 'bg-emerald-500/40 text-emerald-100 border-emerald-400/50' : 'text-slate-300 hover:text-white border-white/10'
                    }`}
                  >
                    {f === 'key' ? 'Tone' : 'BPM'}{sorts[col].field === f && (sorts[col].order === 'asc' ? '↑' : '↓')}
                  </button>
                ))}
              </div>
            )}
            <button 
              onClick={() => setState(prev => {
                const isNowLocked = !prev.locks.col[col];
                const newItemsLocks = { ...prev.locks.items };
                prev.columns[col].forEach(s => newItemsLocks[s.uid] = isNowLocked);
                return { ...prev, locks: { ...prev.locks, col: { ...prev.locks.col, [col]: isNowLocked }, items: newItemsLocks }};
              })}
              className={`rounded-full p-2.5 transition-all ${isLocked ? 'bg-amber-500 text-amber-950 scale-110 shadow-lg shadow-amber-500/40 border border-amber-400' : 'text-slate-300 hover:bg-white/20 hover:text-white'}`}
            >
              <Star size={16} fill={isLocked ? "currentColor" : "none"} />
            </button>
          </div>
        </div>

        <div 
          data-col-items={col}
          className="flex-1 overflow-y-auto px-4 pb-24 space-y-4 custom-scrollbar relative"
        >
          {displayList.map((song, i) => {
            const showPlaceholderBefore = isHoveringThisCol && dragInfo.hoverIndex === i;
            return (
              <React.Fragment key={song.uid}>
                {showPlaceholderBefore && <div className="h-16 rounded-2xl border-2 border-dashed border-blue-400/50 bg-blue-500/20 transition-all" />}
                <div data-song-idx={i}>
                  <SongCard 
                    song={song}
                    index={i}
                    colType={col}
                    isLocked={state.locks.items[song.uid]}
                    onToggleLock={(uid) => setState(prev => ({ ...prev, locks: { ...prev.locks, items: { ...prev.locks.items, [uid]: !prev.locks.items[uid] } } }))}
                    onPointerDown={(e) => handlePointerDown(e, song, col)}
                  />
                </div>
              </React.Fragment>
            );
          })}
          
          {isHoveringThisCol && dragInfo.hoverIndex === displayList.length && (
            <div className="h-16 rounded-2xl border-2 border-dashed border-blue-400/50 bg-blue-500/20 transition-all" />
          )}

          {items.length === 0 && !isHoveringThisCol && (
            <div className="flex h-40 flex-col items-center justify-center rounded-3xl border border-white/10 bg-black/20 text-slate-300">
              <LayoutGrid size={32} className="mb-3 opacity-20" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Vælg sange</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const PrintView = () => {
    const sections = [
      { key: 'set1' as ColumnType, label: 'Sæt 1' },
      { key: 'set2' as ColumnType, label: 'Sæt 2' },
      { key: 'rep' as ColumnType, label: 'Ekstranummer' }
    ];

    return (
      <div className="print-only w-full">
        {sections.map((section) => {
          const songs = state.columns[section.key];
          if (songs.length === 0) return null;

          return (
            <div key={section.key} className="page-break bg-white p-16 text-black min-h-screen">
              <div className="border-b-[6px] border-black pb-6 mb-10 flex justify-between items-baseline">
                <h1 className="text-5xl font-black uppercase tracking-tighter">{state.concertName}</h1>
                <h2 className="text-3xl font-bold text-slate-400 uppercase tracking-widest">{section.label}</h2>
              </div>
              
              <div className="space-y-0">
                {songs.map((s, idx) => (
                  <div key={s.uid} className="border-b border-slate-200 py-8 flex justify-between items-start">
                    <div className="flex gap-10 max-w-[75%]">
                      <span className="font-black text-5xl text-slate-200 tabular-nums">{(idx + 1).toString().padStart(2, '0')}</span>
                      <div className="space-y-3">
                        <div className="text-4xl font-black uppercase tracking-tight">{s.title}</div>
                        {s.notes && (
                          <div className="bg-slate-100 px-4 py-1.5 rounded text-base font-black uppercase inline-block border border-slate-200">
                            Form: {s.notes}
                          </div>
                        )}
                        {s.cues && <div className="text-2xl text-slate-600 italic leading-relaxed font-medium">"{s.cues}"</div>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                       <div className="font-mono font-black text-4xl mb-2 text-black">{s.key || '-'}</div>
                       <div className="font-mono text-slate-500 font-bold text-xl">{s.tempo} BPM</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex h-screen flex-col jazz-bg overflow-hidden">
      <div className="no-print flex h-full flex-col">
        <header className="glass-header sticky top-0 z-40 flex shrink-0 items-center justify-between px-6 py-4 shadow-2xl">
          <div className="flex items-center gap-6 flex-1">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-700 text-white shadow-xl shadow-blue-900/40">
              <Music size={26} />
            </div>
            <div className="flex-1 min-w-0">
              <input 
                className="w-full bg-transparent text-2xl font-black uppercase tracking-tighter text-white focus:outline-none focus:ring-0 truncate placeholder:text-slate-400 text-shadow-sm"
                value={state.concertName}
                onChange={(e) => setState(prev => ({ ...prev, concertName: e.target.value }))}
                placeholder="Navngiv koncert..."
              />
            </div>
          </div>
          <div className="flex items-center gap-3 ml-4">
            <button onClick={() => setShowHelp(true)} className="hidden md:flex h-12 w-12 items-center justify-center rounded-2xl bg-black/40 text-slate-100 hover:text-white hover:bg-black/60 transition-all border border-white/10"><HelpCircle size={22}/></button>
            <button onClick={handleMix} className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-black uppercase tracking-widest text-white hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/40 active:scale-95 border border-blue-400/30"><Wand2 size={18}/> <span className="hidden sm:inline">Mix</span></button>
            <button onClick={() => setShowLibrary(true)} className="flex items-center gap-2 rounded-2xl bg-black/40 px-6 py-3 text-sm font-black uppercase tracking-widest text-slate-100 hover:bg-black/60 transition-all active:scale-95 border border-white/10"><ListMusic size={18}/> <span className="hidden sm:inline">Bibliotek</span></button>
            <button onClick={() => window.print()} className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-950 hover:scale-105 active:scale-95 transition-all shadow-xl border border-slate-200"><Printer size={20}/></button>
          </div>
        </header>

        <main className="flex-1 overflow-x-auto overflow-y-hidden p-6 sm:p-10 scroll-smooth">
          <div className="flex h-full gap-8 w-max mx-auto">
            {renderColumn('set1')}
            {renderColumn('rep')}
            {renderColumn('set2')}
          </div>
        </main>
      </div>

      <PrintView />

      {showLibrary && <LibraryModal state={state} onClose={() => setShowLibrary(false)} onUpdateState={setState} />}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}

      {dragInfo && (
        <div 
          className="fixed pointer-events-none z-[100] w-72 opacity-90 shadow-2xl scale-105"
          style={{ left: dragInfo.x - 40, top: dragInfo.y - 40, transform: 'rotate(2deg)' }}
        >
          <SongCard song={dragInfo.song} index={0} colType={dragInfo.fromCol} isLocked={false} onToggleLock={() => {}} onPointerDown={() => {}} />
        </div>
      )}
    </div>
  );
};

export default App;
