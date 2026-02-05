import { Store, MapPin, Edit3, Trash2, Video, Settings, Power, Home } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface OutletTableProps {
  outlets: any[];
  updateWorkingStatus: (id: string, status: any) => void;
  handleCameraToggle: (outlet: any) => void;
  setEditingOutlet: (outlet: any) => void;
  setDeleteConfirm: (outlet: any) => void;
}

export const OutletTable = ({ 
  outlets, 
  updateWorkingStatus, 
  handleCameraToggle, 
  setEditingOutlet, 
  setDeleteConfirm 
}: OutletTableProps) => {
  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-y-3 text-left">
          <thead>
            <tr className="text-slate-500 uppercase text-[11px] font-bold tracking-widest">
              <th className="px-6 pb-2">Outlet Details</th>
              <th className="px-6 pb-2">Location</th>
              <th className="px-6 pb-2">Status</th>
              <th className="px-6 pb-2">Operation</th>
              <th className="px-6 pb-2 text-center">Live Camera</th>
              <th className="px-6 pb-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {outlets.map((o) => {
                const isDeactivated = o.status !== "ACTIVE";
                const isNotOpen = o.workingState.status !== "OPEN";
                const cameraTooltip = isDeactivated ? "Shop is inactive" : isNotOpen ? "Camera only available when OPEN" : "Toggle Camera";

                return (
                  <motion.tr 
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={o.id} 
                    className={`group transition-all duration-200 ${isDeactivated ? "bg-slate-50/50" : ""}`}
                  >
                    {/* Outlet Details */}
                    <td className="bg-white px-5 py-3 first:rounded-l-2xl shadow-sm border-y border-l border-slate-100 group-hover:border-emerald-200 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-inner transition-colors ${isDeactivated ? 'bg-slate-100 text-slate-400' : 'bg-emerald-50 text-emerald-600'}`}>
                          <Store size={22} />
                        </div>
                        <div>
                          <div className={`text-[15px] font-bold ${isDeactivated ? 'text-slate-400' : 'text-slate-800'}`}>{o.name}</div>
                          <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                            <MapPin size={12} className={isDeactivated ? 'text-slate-300' : 'text-emerald-500'} /> @ {o.branch ?? "Main"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* New Address/Location Cell */}
                    <td className="bg-white px-4 py-3 border-y border-slate-100 group-hover:border-emerald-200 transition-colors">
                      <div className="flex flex-col max-w-[200px]">
                        <div className={`text-[12px] font-bold truncate ${isDeactivated ? 'text-slate-400' : 'text-slate-600'}`}>
                          {o.address || "No Address Added"}
                        </div>
                        <div className="text-[10px] font-medium text-slate-400">
                          PIN: {o.pincode || "N/A"}
                        </div>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="bg-white px-4 py-3 border-y border-slate-100 group-hover:border-emerald-200 transition-colors">
                      <div className={`
                        inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-black tracking-tighter border-2
                        ${!isDeactivated 
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100/50" 
                          : "bg-slate-100 text-slate-500 border-slate-200"
                        }
                      `}>
                        <span className={`h-2 w-2 rounded-full ${!isDeactivated ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                        {o.status}
                      </div>
                    </td>

                    {/* Operation Select */}
                    <td className="bg-white px-4 py-3 border-y border-slate-100 group-hover:border-emerald-200 transition-colors">
                      <div className="flex flex-col gap-1">
                        <div className="relative w-fit">
                            <select 
                                disabled={isDeactivated} 
                                value={o.workingState.status} 
                                onChange={(e) => updateWorkingStatus(o.id, e.target.value as any)}
                                className={`
                                    appearance-none rounded-full border-2 px-3 py-1.5 pr-8 text-[11px] font-black cursor-pointer transition-all outline-none
                                    ${o.workingState.status === 'OPEN' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 
                                      o.workingState.status === 'CLOSED' ? 'bg-rose-50 border-rose-100 text-rose-600' : 
                                      'bg-amber-50 border-amber-100 text-amber-600'}
                                    ${isDeactivated ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:scale-105'}
                                `}
                            >
                                <option value="OPEN">● OPEN</option>
                                <option value="CLOSED">● CLOSED</option>
                                <option value="TEMPORARILY_CLOSED">● TEMP CLOSED</option>
                            </select>
                            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                                <div className={`h-1.5 w-1.5 rounded-full ${o.workingState.status === 'OPEN' ? 'bg-emerald-400' : 'bg-slate-400'}`} />
                            </div>
                        </div>
                        
                      </div>
                    </td>

                    {/* Camera Toggle */}
                    <td className="bg-white px-4 py-3 border-y border-slate-100 group-hover:border-emerald-200 transition-colors">
                      <div className="flex items-center justify-center gap-3">
                         <div 
                          onClick={() => !isDeactivated && !isNotOpen && handleCameraToggle(o)} 
                          className={`
                            relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-all duration-300
                            ${o.cameraState.status === "ON" && !isDeactivated && !isNotOpen ? 'bg-emerald-500 shadow-lg shadow-emerald-200' : 'bg-slate-200'}
                            ${(isDeactivated || isNotOpen) ? 'cursor-not-allowed opacity-40' : ''}
                          `}
                          title={cameraTooltip}
                        >
                          <span className={`
                              pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-300 ease-in-out
                              ${o.cameraState.status === "ON" && !isDeactivated && !isNotOpen ? 'translate-x-5' : 'translate-x-0'}
                            `}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="bg-white px-4 py-3 last:rounded-r-2xl shadow-sm border-y border-r border-slate-100 group-hover:border-emerald-200 transition-colors text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                           onClick={() => setEditingOutlet({ 
                              ...o, 
                              latitude: o.location?.latitude || "", 
                              longitude: o.location?.longitude || "", 
                              deliveryRadiusKm: o.deliveryRadiusKm || "",
                              address: o.address || "",
                              pincode: o.pincode || ""
                           })}
                           className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all active:scale-90"
                           title="Edit"
                        >
                          <Edit3 size={18} />
                        </button>

                        <button 
                            onClick={() => setDeleteConfirm(o)}
                            className={`rounded-xl p-2 transition-all active:scale-90 ${
                                isDeactivated 
                                ? 'text-emerald-500 hover:bg-emerald-50' 
                                : 'text-slate-400 hover:bg-rose-50 hover:text-rose-500'
                            }`}
                            title={isDeactivated ? "Activate" : "Deactivate"}
                        >
                          {isDeactivated ? <Power size={18} /> : <Trash2 size={18} />}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
};