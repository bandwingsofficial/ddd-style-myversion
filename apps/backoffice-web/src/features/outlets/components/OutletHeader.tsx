import { Search, Plus, Filter } from "lucide-react";
import { motion } from "framer-motion";

interface OutletHeaderProps {
  search: string;
  setSearch: (value: string) => void;
  onCreateClick: () => void;
}

export const OutletHeader = ({ search, setSearch, onCreateClick }: OutletHeaderProps) => {
  return (
    <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-center">
      <div>
        <h1 className="text-4xl font-black text-slate-800 tracking-tight">Outlets Management</h1>
        </div>
      
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="flex w-72 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm transition-all focus-within:ring-4 focus-within:ring-emerald-500/10 focus-within:border-emerald-500">
          <Search size={18} className="text-slate-400" />
          <input 
            placeholder="Quick Search..." 
            className="w-full bg-transparent text-sm font-medium text-slate-700 placeholder:text-slate-400 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Create Button */}
        <motion.button 
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 px-6 py-2.5 text-sm font-black text-white shadow-xl shadow-emerald-200 transition-all hover:shadow-emerald-300 active:shadow-none"
          onClick={onCreateClick}
        >
          <Plus size={20} strokeWidth={3} /> <span className="hidden sm:inline">Create Outlet</span>
        </motion.button>
      </div>
    </div>
  );
};