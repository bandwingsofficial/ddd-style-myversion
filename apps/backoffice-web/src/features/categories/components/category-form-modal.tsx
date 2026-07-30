'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';

import { CategoriesApi } from '../api/categories.api';
import { Category, CategoryFormErrors } from '../types/category.types';
import {
  formInputClassName,
  mapServerFieldErrors,
  normalizeCategoryName,
  UNEXPECTED_ERROR_TOAST,
  validateCategoryImage,
  validateCategoryName,
  validateCategoryNameDuplicate,
  validateCategorySubtitle,
} from '../utils/category-validation';
import CategoryImageUpload from './category-image-upload';
import DiscardChangesDialog from './discard-changes-dialog';

type CategoryFormMode = 'create' | 'edit';

interface CategoryFormModalProps {
  mode: CategoryFormMode;
  open: boolean;
  category?: Category | null;
  onClose: () => void;
  onSuccess: () => void;
}

type FieldKey = 'name' | 'subtitle' | 'image';

const FIELD_ORDER: FieldKey[] = ['name', 'subtitle', 'image'];

interface FormSnapshot {
  name: string;
  subtitle: string;
  hasImage: boolean;
  imageChanged: boolean;
  imageRemoved: boolean;
}

export default function CategoryFormModal({
  mode,
  open,
  category = null,
  onClose,
  onSuccess,
}: CategoryFormModalProps) {
  const isCreate = mode === 'create';

  const nameRef = useRef<HTMLInputElement>(null);
  const subtitleRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [existingNames, setExistingNames] = useState<string[]>([]);
  const [errors, setErrors] = useState<CategoryFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [initialSnapshot, setInitialSnapshot] = useState<FormSnapshot>({
    name: '',
    subtitle: '',
    hasImage: false,
    imageChanged: false,
    imageRemoved: false,
  });

  const resetForm = useCallback(() => {
    if (isCreate) {
      setName('');
      setSubtitle('');
      setImageFile(null);
      setRemoveImage(false);
      setImagePreview('');
      setInitialSnapshot({
        name: '',
        subtitle: '',
        hasImage: false,
        imageChanged: false,
        imageRemoved: false,
      });
    } else if (category) {
      setName(category.name);
      setSubtitle(category.subtitle || '');
      setImageFile(null);
      setRemoveImage(false);
      setImagePreview(category.imageUrl || '');
      setInitialSnapshot({
        name: category.name,
        subtitle: category.subtitle || '',
        hasImage: !!category.imageUrl,
        imageChanged: false,
        imageRemoved: false,
      });
    }

    setErrors({});
    setSubmitting(false);
    setUploadProgress(0);
    setShowDiscardDialog(false);
  }, [category, isCreate]);

  useEffect(() => {
    if (!open) {
      return;
    }

    resetForm();

    CategoriesApi.getAll()
      .then((categories) => setExistingNames(categories.map((item) => item.name)))
      .catch(() => {
        // Duplicate check falls back to server-side validation.
      });
  }, [open, resetForm]);

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const imageRequired = isCreate;

  const buildFieldErrors = useCallback(
    (
      nextName: string,
      nextSubtitle: string,
      nextImageFile: File | null,
      options?: { checkDuplicate?: boolean },
    ): CategoryFormErrors => {
      const nextErrors: CategoryFormErrors = {
        name: validateCategoryName(nextName),
        subtitle: validateCategorySubtitle(nextSubtitle),
        image: validateCategoryImage(nextImageFile, imageRequired),
      };

      if (options?.checkDuplicate) {
        const duplicateError = validateCategoryNameDuplicate(
          nextName,
          existingNames,
          isCreate ? undefined : category?.name,
        );

        if (duplicateError) {
          nextErrors.name = duplicateError;
        }
      }

      return nextErrors;
    },
    [category?.name, existingNames, imageRequired, isCreate],
  );

  const currentErrors = useMemo(
    () => buildFieldErrors(name, subtitle, imageFile, { checkDuplicate: true }),
    [buildFieldErrors, name, subtitle, imageFile],
  );

  const isFormValid = useMemo(
    () =>
      !currentErrors.name &&
      !currentErrors.subtitle &&
      !currentErrors.image &&
      (isCreate ? !!imageFile : true),
    [currentErrors, imageFile, isCreate],
  );

  const isDirty = useMemo(() => {
    if (isCreate) {
      return (
        name.trim().length > 0 ||
        subtitle.trim().length > 0 ||
        !!imageFile
      );
    }

    return (
      name !== initialSnapshot.name ||
      subtitle !== initialSnapshot.subtitle ||
      !!imageFile ||
      removeImage
    );
  }, [
    imageFile,
    initialSnapshot.name,
    initialSnapshot.subtitle,
    isCreate,
    name,
    removeImage,
    subtitle,
  ]);

  const updateName = (value: string) => {
    setName(value);
    setErrors((current) => ({
      ...current,
      name:
        validateCategoryNameDuplicate(
          value,
          existingNames,
          isCreate ? undefined : category?.name,
        ) ?? validateCategoryName(value),
    }));
  };

  const updateSubtitle = (value: string) => {
    setSubtitle(value);
    setErrors((current) => ({
      ...current,
      subtitle: validateCategorySubtitle(value),
    }));
  };

  const updateImage = (file: File | null) => {
    if (imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(file);
    setRemoveImage(false);
    setImagePreview(
      file
        ? URL.createObjectURL(file)
        : isCreate
          ? ''
          : category?.imageUrl || '',
    );
    setErrors((current) => ({
      ...current,
      image: validateCategoryImage(file, imageRequired),
    }));
  };

  const handleRemoveImage = () => {
    if (imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(null);
    setRemoveImage(true);
    setImagePreview('');
    setErrors((current) => ({
      ...current,
      image: validateCategoryImage(null, imageRequired),
    }));
  };

  const focusField = (field: FieldKey) => {
    const refMap = {
      name: nameRef,
      subtitle: subtitleRef,
      image: imageRef,
    };

    const target = refMap[field].current;

    if (!target) {
      return;
    }

    if (field === 'image') {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target.focus({ preventScroll: true });
      return;
    }

    target.focus({ preventScroll: true });
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const focusFirstInvalidField = (nextErrors: CategoryFormErrors) => {
    for (const field of FIELD_ORDER) {
      if (nextErrors[field]) {
        focusField(field);
        break;
      }
    }
  };

  const forceClose = useCallback(() => {
    setShowDiscardDialog(false);
    onClose();
  }, [onClose]);

  const requestClose = useCallback(() => {
    if (submitting) {
      return;
    }

    if (isDirty) {
      setShowDiscardDialog(true);
      return;
    }

    forceClose();
  }, [forceClose, isDirty, submitting]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();

        if (showDiscardDialog) {
          setShowDiscardDialog(false);
          return;
        }

        requestClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, requestClose, showDiscardDialog]);

  const handleSubmit = async () => {
    const nextErrors = buildFieldErrors(name, subtitle, imageFile, {
      checkDuplicate: true,
    });

    setErrors(nextErrors);

    if (Object.values(nextErrors).some(Boolean) || submitting) {
      focusFirstInvalidField(nextErrors);
      return;
    }

    if (!isCreate && !category) {
      return;
    }

    setSubmitting(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('name', normalizeCategoryName(name));

      if (subtitle.trim()) {
        formData.append('subtitle', subtitle.trim());
      } else if (!isCreate) {
        formData.append('subtitle', '');
      }

      if (imageFile) {
        formData.append('image', imageFile);
      }

      if (!isCreate && removeImage) {
        formData.append('removeImage', 'true');
      }

      const onUploadProgress = (progress: number) => {
        setUploadProgress(progress);
      };

      if (isCreate) {
        await CategoriesApi.create(formData, onUploadProgress);
        toast.success('Category created successfully.');
      } else {
        await CategoriesApi.update(category!.id, formData, onUploadProgress);
        toast.success('Category updated successfully.');
      }

      onSuccess();
      forceClose();
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { status?: number; data?: { message?: string | string[] } };
      };
      const message = axiosError.response?.data?.message;
      const fieldErrors = mapServerFieldErrors(message);

      if (Object.keys(fieldErrors).length > 0) {
        setErrors((current) => ({ ...current, ...fieldErrors }));
        focusFirstInvalidField(fieldErrors);
        return;
      }

      if (axiosError.response?.status === 400) {
        return;
      }

      toast.error(UNEXPECTED_ERROR_TOAST);
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  if (!open || (!isCreate && !category)) {
    return null;
  }

  const title = isCreate ? 'Create Category' : 'Edit Category';
  const subtitleText = isCreate
    ? 'Add a new category with a cover image.'
    : 'Update category details and cover image.';
  const submitLabel = isCreate ? 'Create Category' : 'Save Changes';

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-[1px]"
            onClick={requestClose}
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="category-form-title"
              className="flex max-h-[90vh] w-full max-w-[700px] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex shrink-0 items-start justify-between border-b border-border px-5 py-4 sm:px-6">
                <div>
                  <h2
                    id="category-form-title"
                    className="text-lg font-bold tracking-tight text-foreground"
                  >
                    {title}
                  </h2>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {subtitleText}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={requestClose}
                  disabled={submitting}
                  aria-label="Close"
                  className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                >
                  <X size={18} />
                </button>
              </div>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  if (isFormValid && !submitting) {
                    void handleSubmit();
                  }
                }}
                className="flex min-h-0 flex-1 flex-col"
              >
                <div
                  ref={bodyRef}
                  className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6"
                >
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="category-name"
                        className="text-sm font-semibold text-foreground"
                      >
                        Category Name <span className="text-destructive">*</span>
                      </label>
                      <input
                        ref={nameRef}
                        id="category-name"
                        value={name}
                        onChange={(event) => updateName(event.target.value)}
                        onBlur={() => {
                          setErrors((current) => ({
                            ...current,
                            name:
                              validateCategoryNameDuplicate(
                                name,
                                existingNames,
                                isCreate ? undefined : category?.name,
                              ) ?? validateCategoryName(name),
                          }));
                        }}
                        disabled={submitting}
                        autoFocus
                        placeholder="Enter category name"
                        className={formInputClassName(!!errors.name)}
                      />
                      {errors.name && (
                        <p className="text-sm text-destructive" role="alert">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="category-subtitle"
                        className="text-sm font-semibold text-foreground"
                      >
                        Subtitle
                      </label>
                      <input
                        ref={subtitleRef}
                        id="category-subtitle"
                        value={subtitle}
                        onChange={(event) =>
                          updateSubtitle(event.target.value)
                        }
                        onBlur={() => {
                          setErrors((current) => ({
                            ...current,
                            subtitle: validateCategorySubtitle(subtitle),
                          }));
                        }}
                        disabled={submitting}
                        placeholder="Optional subtitle"
                        className={formInputClassName(!!errors.subtitle)}
                      />
                      {errors.subtitle && (
                        <p className="text-sm text-destructive" role="alert">
                          {errors.subtitle}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-foreground">
                        Cover Image{' '}
                        {isCreate && (
                          <span className="text-destructive">*</span>
                        )}
                      </label>
                      <div ref={imageRef} tabIndex={-1} className="outline-none">
                        <CategoryImageUpload
                          previewUrl={imagePreview}
                          error={errors.image}
                          disabled={submitting}
                          uploading={submitting && !!imageFile}
                          uploadProgress={uploadProgress}
                          showRemove={!isCreate}
                          onFileSelect={(file) => updateImage(file)}
                          onRemove={handleRemoveImage}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 justify-end gap-3 border-t border-border px-5 py-4 sm:px-6">
                  <button
                    type="button"
                    onClick={requestClose}
                    disabled={submitting}
                    className="inline-flex h-11 items-center rounded-xl border border-input px-4 text-sm font-semibold transition-colors hover:bg-muted disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !isFormValid}
                    className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting && (
                      <Loader2 size={16} className="animate-spin" />
                    )}
                    {submitLabel}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <DiscardChangesDialog
        open={showDiscardDialog}
        onContinue={() => setShowDiscardDialog(false)}
        onDiscard={forceClose}
      />
    </>
  );
}
