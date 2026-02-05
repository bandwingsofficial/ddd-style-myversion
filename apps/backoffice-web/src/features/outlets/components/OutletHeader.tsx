import { Search, Plus } from "lucide-react";
import { motion } from "framer-motion";

interface OutletHeaderProps {
  search: string;
  setSearch: (value: string) => void;
  onCreateClick: () => void;
}

export const OutletHeader = ({ search, setSearch, onCreateClick }: OutletHeaderProps) => {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Outlets Management</h1>
        <p className="mt-1 text-sm text-slate-500 font-medium">Super Admin Control Panel</p>
      </div>
      
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="flex w-64 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm transition-shadow focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500">
          <Search size={18} className="text-slate-400" />
          <input 
            placeholder="Search outlets..." 
            className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Create Button */}
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-b from-emerald-400 to-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition-all hover:shadow-emerald-300 hover:from-emerald-500 hover:to-emerald-700"
          onClick={onCreateClick}
        >
          <Plus size={18} strokeWidth={2.5} /> <span className="hidden sm:inline">Create Outlet</span>
        </motion.button>
      </div>
    </div>
  );
};