'use client';

import {
  Edit3,
  Key,
  Mail,
  Power,
  PowerOff,
  Search,
  Trash2,
  User,
  Users,
  X,
} from 'lucide-react';

import { IconActionButton } from '@/components/ui/icon-action-button';
import { OutletUser } from '../types/outlet-user.types';
import OutletUserTableSkeleton from './outlet-user-table-skeleton';

function formatRole(role?: string | null) {
  if (!role) return 'Staff';
  return role.charAt(0) + role.slice(1).toLowerCase();
}

interface Props {
  users: OutletUser[];
  loading: boolean;
  error?: string | null;
  page: number;
  totalPages: number;
  total: number;
  search: string;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
  onEdit: (user: OutletUser) => void;
  onToggleStatus: (user: OutletUser) => void;
  onResetPassword: (user: OutletUser) => void;
  onDelete: (user: OutletUser) => void;
  actionLoadingId?: string | null;
}

export default function OutletUserTable({
  users,
  loading,
  error,
  page,
  totalPages,
  total,
  search,
  onSearchChange,
  onPageChange,
  onRefresh,
  onEdit,
  onToggleStatus,
  onResetPassword,
  onDelete,
  actionLoadingId = null,
}: Props) {
  if (loading) {
    return <OutletUserTableSkeleton />;
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center">
        <p className="text-sm font-medium text-destructive">{error}</p>
        <button
          type="button"
          onClick={onRefresh}
          className="mt-4 rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by name, email, phone, or role..."
            className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-10 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {total} user{total === 1 ? '' : 's'}
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/50">
            <tr>
              {['User', 'Email', 'Role', 'Status', 'Actions'].map((column) => (
                <th
                  key={column}
                  className={`px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground ${
                    column === 'Actions' ? 'text-right' : ''
                  }`}
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => {
              const isBusy = actionLoadingId === user.id;

              return (
                <tr key={user.id} className="transition-colors hover:bg-muted/30">
                  <td className="px-4 py-3 align-middle">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <User size={14} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-foreground">
                          {user.name || user.email}
                        </p>
                        {user.phone && (
                          <p className="truncate text-xs text-muted-foreground">
                            {user.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail size={14} />
                      <span className="truncate font-medium text-foreground">
                        {user.email}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <span className="inline-flex items-center rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-xs font-semibold text-foreground">
                      {formatRole(user.role)}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
                        user.isActive
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border-border bg-muted text-muted-foreground'
                      }`}
                    >
                      {user.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <div className="flex items-center justify-end gap-1">
                      {user.isActive && (
                        <IconActionButton
                          icon={<Edit3 size={14} />}
                          label="Edit user"
                          variant="edit"
                          disabled={isBusy}
                          onClick={() => onEdit(user)}
                        />
                      )}
                      {user.isActive ? (
                        <IconActionButton
                          icon={<PowerOff size={14} />}
                          label="Inactivate user"
                          variant="deactivate"
                          disabled={isBusy}
                          onClick={() => onToggleStatus(user)}
                        />
                      ) : (
                        <IconActionButton
                          icon={<Power size={14} />}
                          label="Activate user"
                          variant="activate"
                          disabled={isBusy}
                          onClick={() => onToggleStatus(user)}
                        />
                      )}
                      <IconActionButton
                        icon={<Key size={14} />}
                        label="Reset password"
                        variant="reset"
                        disabled={isBusy}
                        onClick={() => onResetPassword(user)}
                      />
                      <IconActionButton
                        icon={<Trash2 size={14} />}
                        label="Delete user"
                        variant="delete"
                        disabled={isBusy || user.isActive}
                        onClick={() => onDelete(user)}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center">
                  <Users
                    size={32}
                    className="mx-auto text-muted-foreground/40"
                  />
                  <p className="mt-2 text-sm text-muted-foreground">
                    {search
                      ? 'No users match your search.'
                      : 'No users assigned to this outlet yet.'}
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
