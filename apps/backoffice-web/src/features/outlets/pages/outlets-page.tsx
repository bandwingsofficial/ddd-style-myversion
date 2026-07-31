'use client';

import { useState } from 'react';
import {
  CheckCircle2,
  Plus,
  Store,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

import SmartDeleteDialogs from '@/components/ui/smart-delete-dialogs';
import { useSmartDelete } from '@/hooks/use-smart-delete';
import { OutletsApi } from '../api/outlets.api';
import OutletFormModal from '../components/outlet-form-modal';
import OutletStatusDialog from '../components/outlet-status-dialog';
import OutletTable from '../components/outlet-table';
import { useOutlets } from '../hooks/use-outlets';
import { Outlet } from '../types/outlet.types';
import {
  getApiErrorMessage,
  getOutletStreamUrl,
  UNEXPECTED_ERROR_TOAST,
} from '../utils/outlet-validation';

export default function OutletsPage() {
  const {
    items,
    loading,
    error,
    page,
    totalPages,
    total,
    search,
    statusFilter,
    workingFilter,
    stats,
    setSearch,
    setStatusFilter,
    setWorkingFilter,
    setPage,
    refresh,
  } = useOutlets();

  const [createOpen, setCreateOpen] = useState(false);
  const [editingOutlet, setEditingOutlet] = useState<Outlet | null>(null);
  const [statusTarget, setStatusTarget] = useState<Outlet | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);

  const deleteConfirm = useSmartDelete<Outlet>({
    deleteFn: (outlet, options) =>
      OutletsApi.delete(outlet.id, { force: options?.force }),
    successMessage: 'Outlet deleted permanently.',
    errorMessage: 'Failed to delete outlet.',
    getItemLabel: (outlet) => outlet.name,
    onSuccess: () => {
      if (items.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        refresh();
      }
    },
  });

  const handleToggleStatus = async () => {
    if (!statusTarget) {
      return;
    }

    setStatusLoading(true);

    try {
      if (statusTarget.status === 'ACTIVE') {
        await OutletsApi.disable(statusTarget.id);
        toast.success('Outlet deactivated.');
      } else {
        await OutletsApi.enable(statusTarget.id);
        toast.success('Outlet activated.');
      }

      setStatusTarget(null);
      refresh();
    } catch (error) {
      toast.error(getApiErrorMessage(error, UNEXPECTED_ERROR_TOAST));
    } finally {
      setStatusLoading(false);
    }
  };

  const handleWorkingStatusChange = async (
    id: string,
    status: 'OPEN' | 'CLOSED',
  ) => {
    await OutletsApi.updateWorkingStatus(id, status);
    toast.success('Operation status updated.');
    refresh();
  };

  const handleCameraToggle = async (outlet: Outlet, enabled: boolean) => {
    if (outlet.status !== 'ACTIVE') {
      toast.error('Cannot configure camera: outlet is inactive.');
      return;
    }

    try {
      if (!enabled) {
        await OutletsApi.configureCamera(outlet.id, { enabled: false });
        toast.success('Live camera disabled.');
        refresh();
        return;
      }

      const streamUrl = getOutletStreamUrl(outlet);

      if (!streamUrl) {
        toast.error(
          'Camera stream URL is required. Edit the outlet and add a valid stream URL first.',
        );
        return;
      }

      await OutletsApi.configureCamera(outlet.id, {
        enabled: true,
        streamUrl,
      });
      toast.success('Live camera enabled.');
      refresh();
    } catch (error) {
      toast.error(getApiErrorMessage(error, UNEXPECTED_ERROR_TOAST));
    }
  };

  const statCards = [
    {
      label: 'Total Outlets',
      value: stats.total,
      icon: Store,
      className: 'text-primary bg-primary/10',
    },
    {
      label: 'Active Outlets',
      value: stats.active,
      icon: CheckCircle2,
      className: 'text-emerald-600 bg-emerald-500/10',
    },
    {
      label: 'Open Now',
      value: stats.open,
      icon: CheckCircle2,
      className: 'text-emerald-600 bg-emerald-500/10',
    },
    {
      label: 'Closed Now',
      value: stats.closed,
      icon: XCircle,
      className: 'text-destructive bg-destructive/10',
    },
  ];

  return (
    <div className="min-h-screen bg-background p-3 md:p-4 font-sans">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Outlets
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage outlet locations, operation status, and live camera controls.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="group flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95"
        >
          <div className="flex items-center justify-center rounded-full bg-white/20 p-1 transition-transform group-hover:rotate-90">
            <Plus size={16} strokeWidth={3} />
          </div>
          Create Outlet
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-border bg-card p-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.className}`}
              >
                <card.icon size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {card.label}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {card.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <OutletTable
        outlets={items}
        loading={loading}
        error={error}
        page={page}
        totalPages={totalPages}
        total={total}
        search={search}
        statusFilter={statusFilter}
        workingFilter={workingFilter}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onStatusFilterChange={(value) => {
          setStatusFilter(value);
          setPage(1);
        }}
        onWorkingFilterChange={(value) => {
          setWorkingFilter(value);
          setPage(1);
        }}
        onPageChange={setPage}
        onRefresh={refresh}
        onEdit={setEditingOutlet}
        onToggleStatus={setStatusTarget}
        onDelete={deleteConfirm.open}
        onWorkingStatusChange={handleWorkingStatusChange}
        onCameraToggle={handleCameraToggle}
      />

      <OutletFormModal
        mode="create"
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={refresh}
      />

      <OutletFormModal
        mode="edit"
        open={!!editingOutlet}
        outlet={editingOutlet}
        onClose={() => setEditingOutlet(null)}
        onSuccess={refresh}
      />

      <OutletStatusDialog
        outlet={statusTarget}
        loading={statusLoading}
        onClose={() => setStatusTarget(null)}
        onConfirm={() => void handleToggleStatus()}
      />

      <SmartDeleteDialogs
        entityName="Outlet"
        itemLabel={deleteConfirm.itemLabel}
        showInitial={
          !!deleteConfirm.target &&
          !deleteConfirm.forceAnalysis &&
          !deleteConfirm.blockedAnalysis
        }
        initialDescription="This action is permanent and cannot be undone."
        forceAnalysis={deleteConfirm.forceAnalysis}
        blockedAnalysis={deleteConfirm.blockedAnalysis}
        blockedMessage={deleteConfirm.blockedMessage}
        loading={deleteConfirm.loading}
        onCancel={deleteConfirm.close}
        onConfirm={() => void deleteConfirm.confirm()}
        onConfirmForce={() => void deleteConfirm.confirmForce()}
        onCloseBlocked={deleteConfirm.closeBlocked}
        onCloseForce={deleteConfirm.closeForce}
      />
    </div>
  );
}
