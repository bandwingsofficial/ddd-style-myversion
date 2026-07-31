'use client';

import { useState } from 'react';
import {
  Edit3,
  MapPin,
  Power,
  PowerOff,
  Search,
  Store,
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import { IconActionButton } from '@/components/ui/icon-action-button';
import { Select } from '@/components/ui/select';
import {
  Outlet,
  OutletStatusFilter,
  OutletWorkingFilter,
  WorkingStatus,
} from '../types/outlet.types';
import OutletTableSkeleton from './outlet-table-skeleton';

const WORKING_OPTIONS = [
  { value: 'OPEN', label: 'Open' },
  { value: 'CLOSED', label: 'Closed' },
];

const STATUS_FILTER_OPTIONS = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
];

const WORKING_FILTER_OPTIONS = [
  { value: 'ALL', label: 'All operations' },
  { value: 'OPEN', label: 'Open' },
  { value: 'CLOSED', label: 'Closed' },
];

function normalizeWorkingStatus(status?: WorkingStatus): 'OPEN' | 'CLOSED' {
  return status === 'OPEN' ? 'OPEN' : 'CLOSED';
}

interface Props {
  outlets: Outlet[];
  loading: boolean;
  error?: string | null;
  page: number;
  totalPages: number;
  total: number;
  search: string;
  statusFilter: OutletStatusFilter;
  workingFilter: OutletWorkingFilter;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: OutletStatusFilter) => void;
  onWorkingFilterChange: (value: OutletWorkingFilter) => void;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
  onEdit: (outlet: Outlet) => void;
  onToggleStatus: (outlet: Outlet) => void;
  onDelete: (outlet: Outlet) => void;
  onWorkingStatusChange: (id: string, status: 'OPEN' | 'CLOSED') => Promise<void>;
  onCameraToggle: (outlet: Outlet, enabled: boolean) => Promise<void>;
}

export default function OutletTable({
  outlets,
  loading,
  error,
  page,
  totalPages,
  total,
  search,
  statusFilter,
  workingFilter,
  onSearchChange,
  onStatusFilterChange,
  onWorkingFilterChange,
  onPageChange,
  onRefresh,
  onEdit,
  onToggleStatus,
  onDelete,
  onWorkingStatusChange,
  onCameraToggle,
}: Props) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editingOperationId, setEditingOperationId] = useState<string | null>(
    null,
  );

  if (loading) {
    return <OutletTableSkeleton />;
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

  const handleWorkingChange = async (
    outlet: Outlet,
    status: 'OPEN' | 'CLOSED',
  ) => {
    setBusyId(outlet.id);
    try {
      await onWorkingStatusChange(outlet.id, status);
      setEditingOperationId(null);
    } catch {
      toast.error('Failed to update operation status.');
    } finally {
      setBusyId(null);
    }
  };

  const handleCameraToggle = async (outlet: Outlet, enabled: boolean) => {
    setBusyId(outlet.id);
    try {
      await onCameraToggle(outlet, enabled);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <div className="relative min-w-0 flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search outlets..."
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

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:w-auto xl:grid-cols-2">
          <Select
            value={statusFilter}
            onChange={(value) =>
              onStatusFilterChange(value as OutletStatusFilter)
            }
            options={STATUS_FILTER_OPTIONS}
            aria-label="Filter by status"
          />
          <Select
            value={workingFilter}
            onChange={(value) =>
              onWorkingFilterChange(value as OutletWorkingFilter)
            }
            options={WORKING_FILTER_OPTIONS}
            aria-label="Filter by operation status"
          />
        </div>

        <div className="text-sm text-muted-foreground xl:whitespace-nowrap">
          {total} outlet{total === 1 ? '' : 's'}
        </div>
      </div>

      {outlets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16 text-center">
          <div className="mb-4 rounded-full bg-muted p-4">
            <Store size={32} className="text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-bold text-foreground">
            {search || statusFilter !== 'ALL' || workingFilter !== 'ALL'
              ? 'No matching outlets'
              : 'No outlets yet'}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {search || statusFilter !== 'ALL' || workingFilter !== 'ALL'
              ? 'Try adjusting your search or filters.'
              : 'Create your first outlet to get started.'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                {[
                  'Outlet',
                  'Location',
                  'Status',
                  'Operation',
                  'Live Camera',
                  'Actions',
                ].map((column) => (
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
              {outlets.map((outlet) => {
                const isInactive = outlet.status !== 'ACTIVE';
                const workingStatus = normalizeWorkingStatus(
                  outlet.workingState?.status,
                );
                const cameraEnabled = outlet.cameraState?.enabled === true;
                const isBusy = busyId === outlet.id;
                const isEditingOperation = editingOperationId === outlet.id;

                return (
                  <tr
                    key={outlet.id}
                    className={`transition-colors hover:bg-muted/30 ${
                      isInactive ? 'bg-muted/20' : 'bg-background'
                    }`}
                  >
                    <td className="px-4 py-3 align-middle">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                            isInactive
                              ? 'bg-muted text-muted-foreground'
                              : 'bg-primary/10 text-primary'
                          }`}
                        >
                          <Store size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-foreground">
                            {outlet.name}
                          </p>
                          <p className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin size={11} />
                            {outlet.branch ?? 'Main'}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 align-middle">
                      <p className="max-w-[200px] truncate font-medium text-foreground">
                        {outlet.address || 'No address'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PIN: {outlet.pincode || 'N/A'}
                      </p>
                    </td>

                    <td className="px-4 py-3 align-middle">
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-bold ${
                          outlet.status === 'ACTIVE'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border-border bg-muted text-muted-foreground'
                        }`}
                      >
                        {outlet.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 align-middle">
                      {isEditingOperation && !isInactive ? (
                        <div className="flex min-w-[160px] items-center gap-2">
                          <Select
                            value={workingStatus}
                            onChange={(value) =>
                              void handleWorkingChange(
                                outlet,
                                value as 'OPEN' | 'CLOSED',
                              )
                            }
                            options={WORKING_OPTIONS}
                            disabled={isBusy}
                            aria-label={`Operation status for ${outlet.name}`}
                          />
                          <button
                            type="button"
                            onClick={() => setEditingOperationId(null)}
                            className="text-xs font-semibold text-muted-foreground hover:text-foreground"
                          >
                            Done
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={isInactive || isBusy}
                          onClick={() => setEditingOperationId(outlet.id)}
                          className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase transition-opacity ${
                            workingStatus === 'OPEN'
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                              : 'border-destructive/20 bg-destructive/10 text-destructive'
                          } ${
                            isInactive
                              ? 'cursor-not-allowed opacity-60'
                              : 'hover:opacity-80'
                          }`}
                          title={
                            isInactive
                              ? 'Activate outlet to edit operation status'
                              : 'Click to change operation status'
                          }
                        >
                          {workingStatus === 'OPEN' ? 'Open' : 'Closed'}
                        </button>
                      )}
                    </td>

                    <td className="px-4 py-3 align-middle">
                      <label className="inline-flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          checked={cameraEnabled}
                          disabled={isInactive || isBusy}
                          onChange={(event) =>
                            void handleCameraToggle(outlet, event.target.checked)
                          }
                          className="h-4 w-4 accent-primary disabled:cursor-not-allowed disabled:opacity-50"
                          title={
                            isInactive
                              ? 'Activate outlet to configure live camera'
                              : cameraEnabled
                                ? 'Disable live camera'
                                : 'Enable live camera'
                          }
                          aria-label={
                            cameraEnabled
                              ? 'Disable live camera'
                              : 'Enable live camera'
                          }
                        />
                        <span className="text-xs font-medium text-muted-foreground">
                          {cameraEnabled ? 'On' : 'Off'}
                        </span>
                      </label>
                    </td>

                    <td className="px-4 py-3 align-middle">
                      <div className="flex items-center justify-end gap-1">
                        {outlet.status === 'ACTIVE' && (
                          <IconActionButton
                            icon={<Edit3 size={14} />}
                            label="Edit outlet"
                            variant="edit"
                            disabled={isBusy}
                            onClick={() => onEdit(outlet)}
                          />
                        )}
                        {outlet.status === 'ACTIVE' ? (
                          <IconActionButton
                            icon={<PowerOff size={14} />}
                            label="Inactivate outlet"
                            variant="deactivate"
                            disabled={isBusy}
                            onClick={() => onToggleStatus(outlet)}
                          />
                        ) : (
                          <IconActionButton
                            icon={<Power size={14} />}
                            label="Activate outlet"
                            variant="activate"
                            disabled={isBusy}
                            onClick={() => onToggleStatus(outlet)}
                          />
                        )}
                        <IconActionButton
                          icon={<Trash2 size={14} />}
                          label="Delete outlet"
                          variant="delete"
                          disabled={isBusy}
                          onClick={() => onDelete(outlet)}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

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
