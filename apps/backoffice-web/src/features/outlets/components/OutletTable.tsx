"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Store, MapPin, MoreHorizontal, Edit3, Trash2 } from "lucide-react";

interface TableProps {
  outlets: any[];
  updateWorkingStatus: (id: string, status: any) => void;
  handleCameraToggle: (o: any) => void;
  setEditingOutlet: (o: any) => void;
  setDeleteConfirm: (o: any) => void;
}

export const OutletTable = ({ outlets, updateWorkingStatus, handleCameraToggle, setEditingOutlet, setDeleteConfirm }: TableProps) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead className="bg-slate-50/80">
          <tr>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Outlet Details</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Operation</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Live Camera</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          <AnimatePresence mode="popLayout">
            {outlets.map((o) => {
              const isDeactivated = o.status !== "ACTIVE";
              const isNotOpen = o.workingState.status !== "OPEN";
              return (
                <motion.tr layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={o.id} 
                  className={`transition-colors hover:bg-slate-50/50 ${isDeactivated ? "bg-slate-50/80 grayscale opacity-75" : "bg-white"}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><Store size={18} /></div>
                      <div>
                        <div className="text-sm font-bold text-slate-800">{o.name}</div>
                        <div className="flex items-center gap-1 text-xs text-slate-500 font-medium"><MapPin size={10} /> {o.branch ?? "Main"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold tracking-wide border ${!isDeactivated ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                      <div className={`h-1.5 w-1.5 rounded-full ${!isDeactivated ? "bg-emerald-500" : "bg-slate-400"}`} />
                      {o.status}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative">
                      <select disabled={isDeactivated} value={o.workingState.status} onChange={(e) => updateWorkingStatus(o.id, e.target.value as any)}
                        className="w-full min-w-[140px] appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-xs font-bold text-slate-700 shadow-sm focus:border-emerald-500 focus:outline-none disabled:bg-slate-50 cursor-pointer">
                        <option value="OPEN">🟢 OPEN</option>
                        <option value="CLOSED">🔴 CLOSED</option>
                        <option value="TEMPORARILY_CLOSED">🟡 TEMP CLOSED</option>
                      </select>
                      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><MoreHorizontal size={14} /></div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div onClick={() => handleCameraToggle(o)} 
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors ${o.cameraState.status === "ON" && !isDeactivated && !isNotOpen ? 'bg-emerald-500' : 'bg-slate-200'} ${(isDeactivated || isNotOpen) ? 'cursor-not-allowed opacity-60' : ''}`}>
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${o.cameraState.status === "ON" && !isDeactivated && !isNotOpen ? 'translate-x-5' : 'translate-x-0'}`} />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setEditingOutlet({ ...o, latitude: o.location?.latitude || "", longitude: o.location?.longitude || "", deliveryRadiusKm: o.deliveryRadiusKm || "" })} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition-colors"><Edit3 size={16} /></button>
                      {isDeactivated ? (
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setDeleteConfirm(o)} className="rounded-lg bg-emerald-500 px-3 py-1.5 text-[10px] font-bold text-white shadow-sm shadow-emerald-200 hover:bg-emerald-600">ACTIVATE</motion.button>
                      ) : (
                        <button onClick={() => setDeleteConfirm(o)} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  </motion.div>
);