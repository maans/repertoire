
export interface SongItem {
  uid: string;
  title: string;
  key: string;
  tempo: string;
  notes: string; // Form
  cues: string;  // Cues
  createdAt: number;
}

export type ColumnType = 'set1' | 'rep' | 'set2';

export interface AppState {
  concertName: string;
  columns: {
    set1: SongItem[];
    rep: SongItem[];
    set2: SongItem[];
  };
  locks: {
    col: {
      set1: boolean;
      rep: boolean;
      set2: boolean;
    };
    items: {
      [uid: string]: boolean;
    };
  };
}

export enum SortOrder {
  NEUTRAL = 'neutral',
  ASC = 'asc',
  DESC = 'desc'
}

export interface ColumnSort {
  field: 'title' | 'key' | 'tempo' | null;
  order: SortOrder;
}
