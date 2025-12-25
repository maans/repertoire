
import { AppState, SongItem } from './types';

const createSong = (title: string, key: string, tempo: string, notes: string, cues: string = ''): SongItem => ({
  uid: Math.random().toString(36).substr(2, 9),
  title,
  key,
  tempo,
  notes,
  cues,
  createdAt: Date.now()
});

export const INITIAL_DATA: AppState = {
  concertName: 'Jazz Quartet Live',
  columns: {
    set1: [],
    rep: [
      createSong('All The Things You Are', 'Cm/eb', '138', 'Intro (4 sidste t.); vokal+sax; solo bas/gui; solo sax; vokal (rit.)', ''),
      createSong('Brevet', 'Dm', '66', 'Intro (D.S. og ud); vokal; solo fl (AA+B); vokal (D.S. og ud)', ''),
      createSong('Dansevise', 'Am', '160', 'Intro (8t u.sax); vokal; solo sax; solo gui/vok (fra t. 21); coda (rubato)', ''),
      createSong('Deirdres Samba', 'Cm', '72', 'Intro (sidste 8t u.fl); vokal+ml spil (8t); vokal+ml spil (8t); vokal (slut på 4-slag)', ''),
      createSong('Desafinado', 'F', '132', 'Intro 8t u.sax; vokal; solo sax; vokal+sax fra C; outro (7t.)', ''),
      createSong('Dejlighedssang', 'Bb', '88', 'Instr sax+bas; vokal+gui; vokal+bas; tutti (f); solo sax; vokal (u.Sax); vokal+sax; tutti (p)', ''),
      createSong('Hvorfor er lykken så lunefuld', 'Fm', '54', 'Intro vers (t1-12 u.sax); vokal; solo sax; solo gui/vok (B); outro intro (rit bas)', ''),
      createSong('Libertango', 'Cm', '116', 'A0+A1-sax; B gui; A2 gui; A0+A1 vok; B+A2 sax; A0-sax; A1-gui+bas (lyrisk); B+A2 vokal+sax', ''),
      createSong('Nature Boy', 'Dm', '108', 'Intro (bas4t+gui4t); vokal (1/2 H 1/2 S); solo fl; vokal (H+S)/Da capo; outro (tutti)', ''),
      createSong('Quiet Night Of Quiet Stars', 'Bb', '63', 'Intro (t25 og ud); vokal; solo-sax; solo-gui; vokal+sax (u. rit.)', ''),
      createSong('Round Midnight', 'Cm', '60', 'Intro sax (solo)+gui; instr; vokal; solo-sax (2xA)/Gui (B+A); sax (2xA, mel)/vok (B+A)', ''),
      createSong('Sakta vi gå gennem stan', 'Bb', '108', 'Instr sax; vokal; solo gui/bas; vokal+sax (rit.)', ''),
      createSong('There Will Never Be Another You', 'C', '152', 'Intro (4 sidste t); vokal; chase vok/fl; chase gui/bas; vokal+fl; outro (3x3 t + sidste)', ''),
      createSong('Those Who Were', 'G + Bb', '50', 'Intro (4t); instr sax; vokal/+sax fra B; vokal+sax; solo sax; outro (4t.)', ''),
      createSong('This Masquerade', 'Bbm', '108', 'Intro (4t); instr sax+4t; vokal+4t; solo gui (AB)/vok+sax (A); outro (3 x t.13-16, rit)', ''),
      createSong('Wave', 'Eb', '126', 'Intro 8t; vokal; solo gui; solo sax AA/vok BC; outro (8t.)', ''),
      createSong('Autumn Leaves', 'Cm', '138', 'Intro sax (rubato); instr sax; vokal; solo sax; outro (rit)', ''),
      createSong('What It Means To Me', 'Cm/Eb', '60', 'Instr sax; vokal; solo-sax+vok; solo gui; vokal+sax fra B', ''),
    ],
    set2: [],
  },
  locks: {
    col: {
      set1: false,
      rep: false,
      set2: false,
    },
    items: {},
  },
};
