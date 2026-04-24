export const TimelineStep = ({ title, status, active, progress }: any) => (
    <div className="relative pl-10">
        <div className="absolute left-0 top-1 w-6 h-6 rounded-full border-2 border-brand-primary bg-white flex items-center justify-center z-10">
            <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse" />
        </div>
        <div className="space-y-1">
            <p className="text-lg font-serif italic text-brand-dark">{title}</p>
            <p className="text-[10px] font-sans font-bold text-brand-primary/60 uppercase tracking-widest">{status}</p>
            <div className="mt-4 w-full h-1 bg-brand-primary/10 rounded-full overflow-hidden">
                <div className="h-full bg-brand-primary rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
            </div>
        </div>
    </div>
);