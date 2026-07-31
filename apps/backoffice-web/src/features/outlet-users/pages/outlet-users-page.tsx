'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus } from 'lucide-react';
import { toast } from 'sonner';

import ConfirmDeleteDialog from '@/components/ui/confirm-delete-dialog';
import { getApiErrorMessage } from '@/lib/api-error';
import { useDeleteConfirm } from '@/hooks/use-delete-confirm';
import { OutletsApi } from '@/features/outlets/api/outlets.api';
import { OutletUsersApi } from '../api/outlet-users.api';
import OutletUserFormModal from '../components/outlet-user-form-modal';
import OutletUserResetPasswordModal from '../components/outlet-user-reset-password-modal';
import OutletUserStatusDialog from '../components/outlet-user-status-dialog';
import OutletUserTable from '../components/outlet-user-table';
import { useOutletUsers } from '../hooks/use-outlet-users';
import { OutletUser } from '../types/outlet-user.types';

export default function OutletUsersPage() {
  const router = useRouter();
  const { outletId } = useParams<{ outletId: string }>();

  const {
    items,
    loading,
    error,
    page,
    totalPages,
    total,
    search,
    setSearch,
    setPage,
    refresh,
  } = useOutletUsers(outletId);

  const [outletName, setOutletName] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<OutletUser | null>(null);
  const [statusTarget, setStatusTarget] = useState<OutletUser | null>(null);
  const [resetTarget, setResetTarget] = useState<OutletUser | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    if (!outletId) return;
    void OutletsApi.getById(outletId).then((outlet) => {
      setOutletName(outlet?.name ?? 'Unknown Outlet');
    });
  }, [outletId]);

  const deleteConfirm = useDeleteConfirm<OutletUser>({
    deleteFn: (user) => OutletUsersApi.delete(user.id),
    successMessage: 'User deleted permanently.',
    errorMessage: 'Failed to delete user.',
    onSuccess: () => {
      if (items.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        refresh();
      }
    },
  });

  const handleToggleStatus = async () => {
    if (!statusTarget) return;

    setStatusLoading(true);
    setActionLoadingId(statusTarget.id);

    try {
      if (statusTarget.isActive) {
        await OutletUsersApi.disable(statusTarget.id);
        toast.success('User deactivated.');
      } else {
        await OutletUsersApi.enable(statusTarget.id);
        toast.success('User activated.');
      }

      setStatusTarget(null);
      refresh();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to update user status.'));
    } finally {
      setStatusLoading(false);
      setActionLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background p-3 md:p-4 font-sans">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <button
            type="button"
            onClick={() => router.push('/users')}
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft size={16} />
            Back to Directory
          </button>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {outletName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage outlet user accounts and access.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus size={16} />
          Create User
        </button>
      </div>

      <OutletUserTable
        users={items}
        loading={loading}
        error={error}
        page={page}
        totalPages={totalPages}
        total={total}
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onPageChange={setPage}
        onRefresh={refresh}
        onEdit={setEditingUser}
        onToggleStatus={setStatusTarget}
        onResetPassword={setResetTarget}
        onDelete={deleteConfirm.open}
        actionLoadingId={actionLoadingId}
      />

      <OutletUserFormModal
        mode="create"
        open={createOpen}
        outletId={outletId}
        onClose={() => setCreateOpen(false)}
        onSuccess={refresh}
      />

      <OutletUserFormModal
        mode="edit"
        open={!!editingUser}
        outletId={outletId}
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onSuccess={refresh}
      />

      <OutletUserStatusDialog
        user={statusTarget}
        loading={statusLoading}
        onClose={() => setStatusTarget(null)}
        onConfirm={() => void handleToggleStatus()}
      />

      <OutletUserResetPasswordModal
        user={resetTarget}
        onClose={() => setResetTarget(null)}
        onSuccess={refresh}
      />

      <ConfirmDeleteDialog
        open={!!deleteConfirm.target}
        title="Delete User?"
        description="This action is permanent. The user account will be permanently removed. This action cannot be undone."
        itemLabel={deleteConfirm.target?.name ?? ''}
        loading={deleteConfirm.loading}
        onCancel={deleteConfirm.close}
        onConfirm={() => void deleteConfirm.confirm()}
      />
    </div>
  );
}
