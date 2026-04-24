export const PaymentRow = ({ title, date, amount, status }: any) => (
  <div className="flex items-center justify-between p-5 bg-brand-neutral/50 rounded-2xl border border-transparent hover:border-brand-primary/10 transition-all">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-sm shadow-sm">🦷</div>
      <div>
        <p className="text-sm font-serif text-brand-dark">{title}</p>
        <p className="text-[9px] font-sans font-bold text-brand-dark/30 uppercase tracking-widest">{date}</p>
      </div>
    </div>
    <div className="text-right">
      <p className="text-sm font-bold text-brand-dark">{amount}</p>
      <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${status === 'PAGADO' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
        {status}
      </span>
    </div>
  </div>
);