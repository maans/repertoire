
import React from 'react';
import { X, GripVertical, Star, Wand2, ArrowUpDown, Settings, Printer } from 'lucide-react';

interface HelpModalProps {
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-800 p-6">
          <h2 className="text-xl font-black uppercase tracking-tight text-white">Hjælp & Tips</h2>
          <button onClick={onClose} className="rounded-full bg-slate-800 p-2 text-slate-400 hover:text-white"><X size={20}/></button>
        </div>
        
        <div className="p-6 space-y-4">
          <HelpRow icon={<GripVertical size={20}/>} title="Træk & Slip">
            Brug det grå håndtag til venstre for sangtitlen. På touch-skærme kan du stadig scrolle listen normalt – drag aktiveres kun via håndtaget.
          </HelpRow>
          
          <HelpRow icon={<Star size={20} className="text-amber-500"/>} title="Låsning">
            Stjerner på sange holder dem fast i toppen. Stjerner på kolonner låser hele sættet, så Mix og sortering ikke ændrer på det.
          </HelpRow>
          
          <HelpRow icon={<Wand2 size={20} className="text-blue-500"/>} title="Mix">
            Fordeler automatisk alle ulåste sange fra Repertoiret ud i Sæt 1 og Sæt 2. Tryk flere gange for at få en ny fordeling.
          </HelpRow>
          
          <HelpRow icon={<ArrowUpDown size={20} className="text-emerald-500"/>} title="Sortér">
            Klik på filter-knapperne i toppen af en kolonne for at sortere efter Titel, Toneart eller Tempo. Låste sange flytter sig ikke.
          </HelpRow>
          
          <HelpRow icon={<Settings size={20}/>} title="Bibliotek">
            Her kan du tilføje nye numre, redigere Form/Cues eller importere/eksportere din repertoire-liste som en CSV-fil (Excel-venlig).
          </HelpRow>
          
          <HelpRow icon={<Printer size={20}/>} title="Print">
            Genererer optimerede A4-sider klar til scenegulvet. Inkluderer store titler, formbeskrivelser og cues for maksimal læsbarhed.
          </HelpRow>
        </div>
        
        <div className="bg-slate-950/50 p-6 text-center text-xs text-slate-500 font-bold uppercase tracking-widest">
          Setlist Manager Pro v2.0
        </div>
      </div>
    </div>
  );
};

const HelpRow: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="flex gap-4 p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-slate-200 border border-slate-700">
      {icon}
    </div>
    <div className="space-y-1">
      <h4 className="font-black text-slate-100 uppercase text-sm tracking-wider">{title}</h4>
      <p className="text-sm text-slate-400 leading-relaxed">{children}</p>
    </div>
  </div>
);
