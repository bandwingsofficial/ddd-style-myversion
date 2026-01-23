'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Mail, ShieldCheck, Key, Plus, X, 
  Loader2, RefreshCw, Eye, EyeOff, CheckCircle2, AlertCircle 
} from 'lucide-react';
import { UsersService } from '@/features/users/users.service';

export default function OutletUsersPage() {
  const { outletId } = useParams<{ outletId: string }>();

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showCreate, setShowCreate] = useState(false);
  const [resetEmail, setResetEmail] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const [showPass, setShowPass] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const adminId = 'SUPER_ADMIN_ID_FROM_SESSION';

  useEffect(() => {
    fetchUsers();
  }, [outletId]);

  // Success message auto-hide
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  async function fetchUsers() {
    setLoading(true);
    try {
        const res = await UsersService.getUsersByOutlet(outletId);
        setUsers(res.data.data || []);
    } catch (err) {
        console.error("Failed to fetch users", err);
    } finally {
        setLoading(false);
    }
  }

  async function createUser() {
    setError(null);
    if (!email || !password) {
        setError("Email and password are required.");
        return;
    }

    try {
      await UsersService.createUser({
        outletId,
        email,
        password,
        adminId,
      });
      setShowCreate(false);
      setEmail('');
      setPassword('');
      setSuccessMsg('User created successfully!');
      fetchUsers();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to create user');
    }
  }

  async function resetPassword() {
    setError(null);
    if (!newPassword) {
        setError("New password is required.");
        return;
    }

    try {
      await UsersService.resetPassword(resetEmail!, newPassword);
      setResetEmail(null);
      setNewPassword('');
      setSuccessMsg('Password updated successfully!');
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to reset password');
    }
  }

  async function toggleUserStatus(user: any) {
    try {
      if (user.isActive) {
        await UsersService.disableUser(user.id);
      } else {
        await UsersService.enableUser(user.id);
      }
      
      setSuccessMsg(`User ${!user.isActive ? 'activated' : 'deactivated'} successfully!`);
      fetchUsers();
    } catch (e: any) {
      setSuccessMsg('Failed to update status');
    }
  }

  if (loading) return (
    <div className="flex h-screen flex-col items-center justify-center bg-slate-50">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
        <RefreshCw size={40} className="text-emerald-500" />
      </motion.div>
      <p className="mt-4 text-sm font-semibold text-slate-500">Fetching users...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans">
      
      {/* --- SUCCESS TOAST --- */}
      <AnimatePresence>
        {successMsg && (
          <div className="fixed top-6 left-1/2 z-50 -translate-x-1/2">
             <motion.div 
               initial={{ opacity: 0, y: -20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               className="flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-xl shadow-emerald-500/20"
             >
               <CheckCircle2 size={18} /> {successMsg}
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- HEADER --- */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Outlet Users</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">Manage accounts created under this location</p>
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { setShowCreate(true); setShowPass(false); setError(null); }}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-b from-emerald-400 to-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition-all hover:shadow-emerald-300 hover:from-emerald-500 hover:to-emerald-700"
        >
          <Plus size={18} strokeWidth={2.5} /> Create User
        </motion.button>
      </div>

      {/* --- TABLE CARD --- */}
      <motion.div 
        initial={{ y: 10, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
            <thead className="bg-slate-50/80">
                <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">User Email</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                <AnimatePresence mode="popLayout">
                {users.map((u) => (
                    <motion.tr 
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        key={u.id} 
                        className="transition-colors hover:bg-slate-50/50"
                    >
                        {/* Email */}
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                                    <Mail size={16} />
                                </div>
                                <span className="text-sm font-semibold text-slate-800">{u.email}</span>
                            </div>
                        </td>

                        {/* Status Toggle */}
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <span className={`
                                    inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide border
                                    ${u.isActive 
                                        ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                                        : "bg-slate-100 text-slate-500 border-slate-200"
                                    }
                                `}>
                                    <div className={`h-1.5 w-1.5 rounded-full ${u.isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
                                    {u.isActive ? 'ACTIVE' : 'INACTIVE'}
                                </span>

                                <button 
                                    onClick={() => toggleUserStatus(u)}
                                    className={`
                                        relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none
                                        ${u.isActive ? 'bg-emerald-500' : 'bg-slate-300'}
                                    `}
                                >
                                    <span
                                        aria-hidden="true"
                                        className={`
                                            pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                                            ${u.isActive ? 'translate-x-4' : 'translate-x-0'}
                                        `}
                                    />
                                </button>
                            </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                            <motion.button
                                whileHover={{ scale: 1.02, backgroundColor: '#f1f5f9' }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => { setResetEmail(u.email); setShowPass(false); setError(null); }}
                                className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm transition-colors hover:text-slate-900"
                            >
                                <Key size={14} className="mr-1.5 text-slate-400" /> Reset Password
                            </motion.button>
                        </td>
                    </motion.tr>
                ))}
                </AnimatePresence>
                {users.length === 0 && (
                    <tr>
                        <td colSpan={3} className="py-12 text-center text-slate-400 text-sm font-medium">
                            No users found for this outlet.
                        </td>
                    </tr>
                )}
            </tbody>
            </table>
        </div>
      </motion.div>

      {/* --- CREATE USER MODAL --- */}
      <AnimatePresence>
        {showCreate && (
          <Modal title="Create Outlet User" onClose={() => setShowCreate(false)}>
            {error && <ErrorBanner text={error} />}
            <div className="flex flex-col gap-4">
              <div className="space-y-1.5">
                <input 
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10" 
                  placeholder="Email Address" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                />
              </div>
              <div className="relative">
                <input 
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10" 
                  placeholder="Password" 
                  type={showPass ? "text" : "password"} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                />
                <button 
                  onClick={() => setShowPass(!showPass)} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <PrimaryButton onClick={createUser}>Create Account</PrimaryButton>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* --- RESET PASSWORD MODAL --- */}
      <AnimatePresence>
        {resetEmail && (
          <Modal title="Reset Password" onClose={() => setResetEmail(null)}>
            <div className="mb-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
               Setting new password for: <strong className="text-slate-800">{resetEmail}</strong>
            </div>
            
            {error && <ErrorBanner text={error} />}
            
            <div className="flex flex-col gap-4">
              <div className="relative">
                <input 
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10" 
                  placeholder="New Password" 
                  type={showPass ? "text" : "password"} 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                />
                <button 
                  onClick={() => setShowPass(!showPass)} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <PrimaryButton onClick={resetPassword}>Update Password</PrimaryButton>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

/* --- HELPER COMPONENTS --- */

function Modal({ title, children, onClose }: any) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="absolute inset-0" onClick={onClose} />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 bg-white">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors">
            <X size={20}/>
          </button>
        </div>
        
        <div className="p-6">
            {children}
            <button 
                onClick={onClose} 
                className="mt-4 w-full text-center text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
            >
                Cancel and Close
            </button>
        </div>
      </motion.div>
    </div>
  );
}

function PrimaryButton({ children, onClick }: any) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full rounded-xl bg-gradient-to-b from-emerald-400 to-emerald-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition-all hover:shadow-emerald-300 hover:from-emerald-500 hover:to-emerald-700 active:scale-95 uppercase tracking-wider"
    >
      {children}
    </motion.button>
  );
}

function ErrorBanner({ text }: any) {
  return (
    <motion.div 
        initial={{ opacity: 0, height: 0, marginBottom: 0 }} 
        animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
        className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-bold text-rose-600 ring-1 ring-rose-100"
    >
      <AlertCircle size={16} className="shrink-0" /> {text}
    </motion.div>
  );
}