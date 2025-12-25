
import { SongItem, AppState, ColumnType, SortOrder, ColumnSort } from '../types';

export const splitItems = (items: SongItem[], locks: { [uid: string]: boolean }) => {
  const locked = items.filter(item => locks[item.uid]);
  const unlocked = items.filter(item => !locks[item.uid]);
  return { locked, unlocked };
};

export const sortUnlocked = (items: SongItem[], sort: ColumnSort): SongItem[] => {
  if (!sort.field || sort.order === SortOrder.NEUTRAL) return items;

  return [...items].sort((a, b) => {
    let valA = a[sort.field!] || '';
    let valB = b[sort.field!] || '';

    if (sort.field === 'tempo') {
      const numA = parseInt(valA as string) || 0;
      const numB = parseInt(valB as string) || 0;
      return sort.order === SortOrder.ASC ? numA - numB : numB - numA;
    }

    const strA = String(valA).toLowerCase();
    const strB = String(valB).toLowerCase();
    return sort.order === SortOrder.ASC ? strA.localeCompare(strB) : strB.localeCompare(strA);
  });
};

export const mixSets = (state: AppState): AppState => {
  const newState = JSON.parse(JSON.stringify(state)) as AppState;
  const allUnlocked: SongItem[] = [];

  (['set1', 'rep', 'set2'] as ColumnType[]).forEach(col => {
    if (!newState.locks.col[col]) {
      const { unlocked } = splitItems(newState.columns[col], newState.locks.items);
      allUnlocked.push(...unlocked);
      newState.columns[col] = newState.columns[col].filter(item => newState.locks.items[item.uid]);
    }
  });

  if (allUnlocked.length === 0) return state;

  // Forbedret Greedy Shuffle
  const pool = [...allUnlocked];
  const targetCols: ColumnType[] = [];
  if (!newState.locks.col.set1) targetCols.push('set1');
  if (!newState.locks.col.set2) targetCols.push('set2');

  if (targetCols.length === 0) {
    newState.columns.rep.push(...pool);
    return newState;
  }

  // Simpel men effektiv spredning: Shuffle poolen først
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  // Fordel balanceret
  pool.forEach((song, index) => {
    const target = targetCols[index % targetCols.length];
    newState.columns[target].push(song);
  });

  return newState;
};

export const exportToCSV = (state: AppState) => {
  const headers = ["Titel", "Toneart", "Tempo", "Form", "Cues", "_Column", "_Locked"];
  const rows = (['set1', 'rep', 'set2'] as ColumnType[]).flatMap(col => 
    state.columns[col].map(s => [
      s.title, s.key, s.tempo, s.notes, s.cues, col, state.locks.items[s.uid] ? "1" : "0"
    ].map(v => `"${v}"`).join(";"))
  );

  const csvContent = [headers.join(";"), ...rows].join("\n");
  const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${state.concertName || 'setlist'}.csv`;
  link.click();
};

export const parseCSV = (text: string): { songs: SongItem[], colMap: Record<string, ColumnType>, lockMap: Record<string, boolean> } => {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return { songs: [], colMap: {}, lockMap: {} };

  const songs: SongItem[] = [];
  const colMap: Record<string, ColumnType> = {};
  const lockMap: Record<string, boolean> = {};

  // Detekter separator (semikolon er standard i dansk Excel)
  const separator = lines[0].includes(";") ? ";" : ",";

  lines.slice(1).forEach((line, i) => {
    const parts = line.split(separator).map(p => p.replace(/^"|"$/g, '').trim());
    if (parts.length < 5) return;

    const uid = Math.random().toString(36).substr(2, 9);
    songs.push({
      uid,
      title: parts[0] || 'Unavngivet',
      key: parts[1] || '',
      tempo: parts[2] || '',
      notes: parts[3] || '',
      cues: parts[4] || '',
      createdAt: Date.now() - i
    });

    if (parts[5] && ['set1', 'rep', 'set2'].includes(parts[5])) {
      colMap[uid] = parts[5] as ColumnType;
    }
    if (parts[6] === "1") lockMap[uid] = true;
  });

  return { songs, colMap, lockMap };
};
