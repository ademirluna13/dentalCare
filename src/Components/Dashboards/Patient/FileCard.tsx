export const FileCard = ({ title, info, icon }: any) => (
    <div className="bg-white/80 p-8 rounded-[2.5rem] border border-brand-primary/10 flex items-center gap-6 group hover:shadow-xl hover:-translate-y-1 transition-all">
        <div className="text-3xl grayscale group-hover:grayscale-0 transition-all">{icon}</div>
        <div>
            <p className="text-sm font-serif italic text-brand-dark">{title}</p>
            <p className="text-[9px] font-sans font-bold text-brand-dark/30 uppercase tracking-widest">{info}</p>
        </div>
    </div>
);