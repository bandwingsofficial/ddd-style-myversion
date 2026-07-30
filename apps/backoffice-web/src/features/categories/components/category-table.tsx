'use client';

import { useMemo, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Image as ImageIcon,
  ImageOff,
  Loader2,
  Pencil,
  Power,
  PowerOff,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

import { CategoriesApi } from '../api/categories.api';
import { Category } from '../types/category.types';
import CategoryTableSkeleton from './category-table-skeleton';
import EditCategoryModal from './edit-category-modal';
import DeleteCategoryDialog from './delete-category-dialog';

interface Props {
  categories: Category[];
  loading: boolean;
  error?: string | null;
  page: number;
  totalPages: number;
  total: number;
  search: string;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
}

function SortableRow({
  category,
  onEdit,
  onDeactivate,
  onDelete,
  reordering,
  dragEnabled,
}: {
  category: Category;
  onEdit: (category: Category) => void;
  onDeactivate: (category: Category) => void;
  onDelete: (category: Category) => void;
  reordering: boolean;
  dragEnabled: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id, disabled: !dragEnabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <tr ref={setNodeRef} style={style} className="group bg-background">
      <td className="px-4 py-4 align-middle">
        <button
          type="button"
          disabled={reordering || !dragEnabled}
          title={
            dragEnabled
              ? 'Drag to reorder'
              : 'Clear search to reorder categories'
          }
          className="cursor-grab rounded p-1 text-muted-foreground hover:bg-muted active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-50"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
        >
          <GripVertical size={16} />
        </button>
      </td>
      <CategoryCells
        category={category}
        onEdit={onEdit}
        onDeactivate={onDeactivate}
        onDelete={onDelete}
        showEdit
      />
    </tr>
  );
}

function StaticRow({
  category,
  onActivate,
  onDelete,
  actionLoadingId,
}: {
  category: Category;
  onActivate: (category: Category) => void;
  onDelete: (category: Category) => void;
  actionLoadingId: string | null;
}) {
  return (
    <tr className="group bg-muted/20">
      <td className="px-4 py-4 align-middle">
        <div className="h-4 w-4" />
      </td>
      <CategoryCells
        category={category}
        onActivate={onActivate}
        onDelete={onDelete}
        actionLoadingId={actionLoadingId}
      />
    </tr>
  );
}

function CategoryCells({
  category,
  onEdit,
  onDeactivate,
  onActivate,
  onDelete,
  showEdit = false,
  actionLoadingId,
}: {
  category: Category;
  onEdit?: (category: Category) => void;
  onDeactivate?: (category: Category) => void;
  onActivate?: (category: Category) => void;
  onDelete: (category: Category) => void;
  showEdit?: boolean;
  actionLoadingId?: string | null;
}) {
  const isActive = category.status === 'ACTIVE';
  const isLoading = actionLoadingId === category.id;

  return (
    <>
      <td className="px-6 py-4 align-middle">
        <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
          {category.imageUrl ? (
            <img
              src={category.imageUrl}
              alt={category.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <ImageIcon className="h-5 w-5 text-muted-foreground/50" />
          )}
        </div>
      </td>
      <td className="px-6 py-4 align-middle font-semibold text-foreground">
        {category.name}
      </td>
      <td className="px-6 py-4 align-middle text-muted-foreground">
        <div className="max-w-[220px] truncate" title={category.subtitle || ''}>
          {category.subtitle || '-'}
        </div>
      </td>
      <td className="px-6 py-4 align-middle">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border ${
            isActive
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-muted text-muted-foreground border-border'
          }`}
        >
          {isActive ? 'ACTIVE' : 'INACTIVE'}
        </span>
      </td>
      <td className="px-6 py-4 align-middle text-right">
        <div className="flex items-center justify-end gap-2">
          {showEdit && (
            <button
              onClick={() => onEdit?.(category)}
              title="Edit category"
              className="rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-semibold shadow-sm hover:border-primary hover:text-primary"
            >
              <span className="inline-flex items-center gap-1">
                <Pencil size={14} /> Edit
              </span>
            </button>
          )}

          {isActive ? (
            <button
              onClick={() => onDeactivate?.(category)}
              disabled={isLoading}
              className="rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-semibold shadow-sm hover:border-amber-500 hover:text-amber-600 disabled:opacity-50"
            >
              <span className="inline-flex items-center gap-1">
                {isLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <PowerOff size={14} />
                )}
                Deactivate
              </span>
            </button>
          ) : (
            <button
              onClick={() => onActivate?.(category)}
              disabled={isLoading}
              className="rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-semibold shadow-sm hover:border-primary hover:text-primary disabled:opacity-50"
            >
              <span className="inline-flex items-center gap-1">
                {isLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Power size={14} />
                )}
                Activate
              </span>
            </button>
          )}

          <button
            onClick={() => onDelete(category)}
            disabled={isLoading}
            className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50"
          >
            <span className="inline-flex items-center gap-1">
              <Trash2 size={14} /> Delete
            </span>
          </button>
        </div>
      </td>
    </>
  );
}

export default function CategoryTable({
  categories,
  loading,
  error,
  page,
  totalPages,
  total,
  search,
  onSearchChange,
  onPageChange,
  onRefresh,
}: Props) {
  const dragEnabled = !search.trim();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [reordering, setReordering] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  const { activeCategories, inactiveCategories } = useMemo(() => {
    const active = categories.filter((category) => category.status === 'ACTIVE');
    const inactive = categories.filter(
      (category) => category.status === 'INACTIVE',
    );

    return {
      activeCategories: active,
      inactiveCategories: inactive,
    };
  }, [categories]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id || reordering) {
      return;
    }

    setReordering(true);

    try {
      const allCategories = await CategoriesApi.getAll();
      const allActive = allCategories.filter(
        (category) => category.status === 'ACTIVE',
      );

      const oldIndex = allActive.findIndex((item) => item.id === active.id);
      const newIndex = allActive.findIndex((item) => item.id === over.id);

      if (oldIndex < 0 || newIndex < 0) {
        return;
      }

      const reordered = arrayMove(allActive, oldIndex, newIndex);
      const payload = reordered.map((category, index) => ({
        id: category.id,
        sortOrder: index + 1,
      }));

      await CategoriesApi.reorder(payload);
      toast.success('Category order updated.');
      onRefresh();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || 'Failed to reorder categories.',
      );
      onRefresh();
    } finally {
      setReordering(false);
    }
  };

  const handleStatusChange = async (
    category: Category,
    status: 'ACTIVE' | 'INACTIVE',
  ) => {
    setActionLoadingId(category.id);

    try {
      await CategoriesApi.updateStatus(category.id, status);
      toast.success(
        status === 'ACTIVE'
          ? 'Category activated successfully.'
          : 'Category deactivated successfully.',
      );
      onRefresh();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || 'Failed to update category status.',
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory || deleteLoading) {
      return;
    }

    setDeleteLoading(true);

    try {
      await CategoriesApi.delete(deletingCategory.id);
      toast.success('Category deleted permanently.');
      setDeletingCategory(null);
      onRefresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete category.');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return <CategoryTableSkeleton />;
  }

  if (error) {
    return (
      <div className="flex h-64 w-full flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 text-center shadow-sm">
        <h3 className="font-semibold text-foreground">{error}</h3>
        <button
          onClick={onRefresh}
          className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by category name or subtitle"
          className="w-full max-w-md rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
        />
        <p className="text-sm text-muted-foreground">
          {total} categor{total === 1 ? 'y' : 'ies'}
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="flex h-64 w-full flex-col items-center justify-center rounded-xl border border-border bg-card text-center shadow-sm">
          <div className="mb-3 rounded-full bg-muted p-4">
            <ImageOff className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground">No categories found.</h3>
          <p className="text-sm text-muted-foreground">
            Create your first category.
          </p>
        </div>
      ) : (
        <div className="w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/50">
                  <tr>
                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Drag
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Image
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Category
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Subtitle
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <SortableContext
                    items={activeCategories.map((category) => category.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {activeCategories.map((category) => (
                      <SortableRow
                        key={category.id}
                        category={category}
                        reordering={reordering}
                        dragEnabled={dragEnabled}
                        onEdit={setEditingCategory}
                        onDeactivate={(item) =>
                          handleStatusChange(item, 'INACTIVE')
                        }
                        onDelete={setDeletingCategory}
                      />
                    ))}
                  </SortableContext>

                  {inactiveCategories.map((category) => (
                    <StaticRow
                      key={category.id}
                      category={category}
                      actionLoadingId={actionLoadingId}
                      onActivate={(item) => handleStatusChange(item, 'ACTIVE')}
                      onDelete={setDeletingCategory}
                    />
                  ))}
                </tbody>
              </table>
            </DndContext>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="rounded-lg border border-input px-3 py-1.5 text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="rounded-lg border border-input px-3 py-1.5 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      <EditCategoryModal
        category={editingCategory}
        onClose={() => setEditingCategory(null)}
        onSuccess={onRefresh}
      />

      <DeleteCategoryDialog
        category={deletingCategory}
        loading={deleteLoading}
        onCancel={() => setDeletingCategory(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}
