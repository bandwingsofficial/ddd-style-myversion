'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Check,
  GripVertical,
  ImagePlus,
  Layers,
  Loader2,
  Plus,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';

import { Select } from '@/components/ui/select';
import { MultiSelectDropdown } from '@/components/ui/multi-select-dropdown';
import { Category } from '@/features/categories/types/category.types';
import DiscardChangesDialog from '@/features/categories/components/discard-changes-dialog';
import { ProductsApi } from '../api/products.api';
import {
  Product,
  PRODUCT_TAGS,
  ProductFormErrors,
  ProductTag,
  UNIT_TYPES,
} from '../types/product.types';
import {
  formInputClassName,
  formTextareaClassName,
  MAIN_IMAGE_REQUIRED_ERROR,
  mapServerFieldErrors,
  normalizeProductName,
  UNEXPECTED_ERROR_TOAST,
  validateCategoryId,
  validateDiscountPrice,
  validateOriginalPrice,
  validateProductName,
  validateUnitValue,
} from '../utils/product-validation';

type ProductFormMode = 'create' | 'edit';

type GalleryFormItem = {
  key: string;
  id?: string;
  imageUrl?: string;
  file?: File;
};

interface ProductFormModalProps {
  mode: ProductFormMode;
  open: boolean;
  product?: Product | null;
  activeCategories: Category[];
  onClose: () => void;
  onSuccess: () => void;
}

type FieldKey =
  | 'categoryId'
  | 'productName'
  | 'originalPrice'
  | 'discountPrice'
  | 'unitValue'
  | 'mainImage';

const FIELD_ORDER: FieldKey[] = [
  'categoryId',
  'productName',
  'originalPrice',
  'discountPrice',
  'unitValue',
  'mainImage',
];

interface FormSnapshot {
  categoryId: string;
  productName: string;
  originalPrice: number;
  discountPrice: number;
  unitValue: number;
  unitType: string;
  tags: ProductTag[];
  shortDescription: string;
  longDescription: string;
  isTrending: boolean;
  mainImageUrl: string;
  galleryKeys: string[];
}

function createGalleryKey() {
  return `gallery-${crypto.randomUUID()}`;
}

function SortableGalleryItem({
  item,
  preview,
  disabled,
  onRemove,
  onReplace,
}: {
  item: GalleryFormItem;
  preview: string;
  disabled: boolean;
  onRemove: () => void;
  onReplace: (file: File) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.key, disabled });

  const replaceRef = useRef<HTMLInputElement>(null);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-background"
    >
      <img src={preview} className="h-full w-full object-cover" alt="Gallery" />
      {!disabled && (
        <>
          <button
            type="button"
            className="absolute left-1 top-1 rounded bg-background/90 p-1 text-muted-foreground shadow-sm"
            {...attributes}
            {...listeners}
          >
            <GripVertical size={14} />
          </button>
          <input
            ref={replaceRef}
            type="file"
            hidden
            accept="image/*"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                onReplace(file);
              }
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={() => replaceRef.current?.click()}
              className="rounded bg-white/90 p-1 text-slate-800"
            >
              <Upload size={14} />
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="rounded bg-white/90 p-1 text-red-600"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function ProductFormModal({
  mode,
  open,
  product = null,
  activeCategories,
  onClose,
  onSuccess,
}: ProductFormModalProps) {
  const isCreate = mode === 'create';

  const categoryRef = useRef<HTMLButtonElement>(null);
  const productNameRef = useRef<HTMLInputElement>(null);
  const originalPriceRef = useRef<HTMLInputElement>(null);
  const discountPriceRef = useRef<HTMLInputElement>(null);
  const unitValueRef = useRef<HTMLInputElement>(null);
  const mainImageRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [categoryId, setCategoryId] = useState('');
  const [productName, setProductName] = useState('');
  const [originalPrice, setOriginalPrice] = useState<number>(0);
  const [discountPrice, setDiscountPrice] = useState<number>(0);
  const [unitValue, setUnitValue] = useState(1);
  const [unitType, setUnitType] = useState<string>('PCS');
  const [tags, setTags] = useState<ProductTag[]>([]);
  const [shortDescription, setShortDescription] = useState('');
  const [longDescription, setLongDescription] = useState('');
  const [isTrending, setIsTrending] = useState(false);
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainImageUrl, setMainImageUrl] = useState('');
  const [galleryItems, setGalleryItems] = useState<GalleryFormItem[]>([]);
  const [initialGalleryIds, setInitialGalleryIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [initialSnapshot, setInitialSnapshot] = useState<FormSnapshot>({
    categoryId: '',
    productName: '',
    originalPrice: 0,
    discountPrice: 0,
    unitValue: 1,
    unitType: 'PCS',
    tags: [],
    shortDescription: '',
    longDescription: '',
    isTrending: false,
    mainImageUrl: '',
    galleryKeys: [],
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const resetForm = useCallback(() => {
    if (isCreate) {
      setCategoryId('');
      setProductName('');
      setOriginalPrice(0);
      setDiscountPrice(0);
      setUnitValue(1);
      setUnitType('PCS');
      setTags([]);
      setShortDescription('');
      setLongDescription('');
      setIsTrending(false);
      setMainImage(null);
      setMainImageUrl('');
      setGalleryItems([]);
      setInitialGalleryIds([]);
      setInitialSnapshot({
        categoryId: '',
        productName: '',
        originalPrice: 0,
        discountPrice: 0,
        unitValue: 1,
        unitType: 'PCS',
        tags: [],
        shortDescription: '',
        longDescription: '',
        isTrending: false,
        mainImageUrl: '',
        galleryKeys: [],
      });
    } else if (product) {
      const gallery = [...(product.images?.galleryImages || [])]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((item) => ({
          key: item.id,
          id: item.id,
          imageUrl: item.imageUrl,
        }));

      setCategoryId(product.categoryId);
      setProductName(product.name.value);
      setOriginalPrice(product.price.originalPrice);
      setDiscountPrice(product.price.discountPrice || 0);
      setUnitValue(product.unitValue);
      setUnitType(product.unitType);
      setTags((product.tags || []) as ProductTag[]);
      setShortDescription(product.shortDescription || '');
      setLongDescription(product.longDescription || '');
      setIsTrending(product.trendState?.trending || false);
      setMainImage(null);
      setMainImageUrl(product.images?.mainImageUrl || '');
      setGalleryItems(gallery);
      setInitialGalleryIds(gallery.map((item) => item.id!));
      setInitialSnapshot({
        categoryId: product.categoryId,
        productName: product.name.value,
        originalPrice: product.price.originalPrice,
        discountPrice: product.price.discountPrice || 0,
        unitValue: product.unitValue,
        unitType: product.unitType,
        tags: (product.tags || []) as ProductTag[],
        shortDescription: product.shortDescription || '',
        longDescription: product.longDescription || '',
        isTrending: product.trendState?.trending || false,
        mainImageUrl: product.images?.mainImageUrl || '',
        galleryKeys: gallery.map((item) => item.key),
      });
    }

    setErrors({});
    setSubmitting(false);
    setShowDiscardDialog(false);
  }, [isCreate, product]);

  const categoryOptions = useMemo(() => {
    const optionMap = new Map<string, { value: string; label: string }>();

    for (const cat of activeCategories) {
      optionMap.set(cat.id, { value: cat.id, label: cat.name });
    }

    if (product?.categoryId && !optionMap.has(product.categoryId)) {
      optionMap.set(product.categoryId, {
        value: product.categoryId,
        label: product.categoryName || 'Current category',
      });
    }

    return [
      { value: '', label: 'Select Category' },
      ...Array.from(optionMap.values()),
    ];
  }, [activeCategories, product?.categoryId, product?.categoryName]);

  const unitTypeOptions = useMemo(
    () => UNIT_TYPES.map((type) => ({ value: type, label: type })),
    [],
  );

  const tagOptions = useMemo(
    () =>
      PRODUCT_TAGS.map((tag) => ({
        value: tag,
        label: tag.replace(/_/g, ' '),
      })),
    [],
  );

  const updateFieldError = useCallback(
    (field: keyof ProductFormErrors, message?: string) => {
      setErrors((current) => {
        const next = { ...current };
        if (message) {
          next[field] = message;
        } else {
          delete next[field];
        }
        return next;
      });
    },
    [],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    resetForm();
  }, [open, resetForm]);

  const buildFieldErrors = useCallback(
    (
      nextCategoryId: string,
      nextProductName: string,
      nextOriginalPrice: number,
      nextDiscountPrice: number,
      nextUnitValue: number,
      hasMainImage: boolean,
    ): ProductFormErrors => {
      const nextErrors: ProductFormErrors = {
        categoryId: validateCategoryId(nextCategoryId),
        productName: validateProductName(nextProductName),
        originalPrice: validateOriginalPrice(nextOriginalPrice),
        discountPrice: validateDiscountPrice(
          nextDiscountPrice,
          nextOriginalPrice,
        ),
        unitValue: validateUnitValue(nextUnitValue),
      };

      if (isCreate && !hasMainImage) {
        nextErrors.mainImage = MAIN_IMAGE_REQUIRED_ERROR;
      }

      return nextErrors;
    },
    [isCreate],
  );

  const currentErrors = useMemo(
    () =>
      buildFieldErrors(
        categoryId,
        productName,
        originalPrice,
        discountPrice,
        unitValue,
        !!mainImage || !!mainImageUrl,
      ),
    [
      buildFieldErrors,
      categoryId,
      productName,
      originalPrice,
      discountPrice,
      unitValue,
      mainImage,
      mainImageUrl,
    ],
  );

  const isFormValid = useMemo(
    () => !Object.values(currentErrors).some(Boolean),
    [currentErrors],
  );

  const isDirty = useMemo(() => {
    const galleryKeys = galleryItems.map((item) => item.key);

    return (
      categoryId !== initialSnapshot.categoryId ||
      productName !== initialSnapshot.productName ||
      originalPrice !== initialSnapshot.originalPrice ||
      discountPrice !== initialSnapshot.discountPrice ||
      unitValue !== initialSnapshot.unitValue ||
      unitType !== initialSnapshot.unitType ||
      JSON.stringify(tags) !== JSON.stringify(initialSnapshot.tags) ||
      shortDescription !== initialSnapshot.shortDescription ||
      longDescription !== initialSnapshot.longDescription ||
      isTrending !== initialSnapshot.isTrending ||
      !!mainImage ||
      galleryKeys.join('|') !== initialSnapshot.galleryKeys.join('|') ||
      galleryItems.some((item) => !!item.file)
    );
  }, [
    categoryId,
    productName,
    originalPrice,
    discountPrice,
    unitValue,
    unitType,
    tags,
    shortDescription,
    longDescription,
    isTrending,
    mainImage,
    galleryItems,
    initialSnapshot,
  ]);

  const focusField = (field: FieldKey) => {
    const refMap = {
      categoryId: categoryRef,
      productName: productNameRef,
      originalPrice: originalPriceRef,
      discountPrice: discountPriceRef,
      unitValue: unitValueRef,
      mainImage: mainImageRef,
    };

    const target = refMap[field].current;

    if (!target) {
      return;
    }

    target.focus({ preventScroll: true });
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const focusFirstInvalidField = (nextErrors: ProductFormErrors) => {
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

  const mainImagePreview = mainImage
    ? URL.createObjectURL(mainImage)
    : mainImageUrl;

  const getGalleryPreview = (item: GalleryFormItem) => {
    if (item.file) {
      return URL.createObjectURL(item.file);
    }

    return item.imageUrl || '';
  };

  const handleMainImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setMainImage(file);
    setErrors((current) => ({ ...current, mainImage: undefined }));
  };

  const handleGalleryUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) {
      return;
    }

    const newItems = Array.from(event.target.files).map((file) => ({
      key: createGalleryKey(),
      file,
    }));

    setGalleryItems((current) => [...current, ...newItems]);
  };

  const handleGalleryDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    setGalleryItems((items) => {
      const oldIndex = items.findIndex((item) => item.key === active.id);
      const newIndex = items.findIndex((item) => item.key === over.id);

      if (oldIndex < 0 || newIndex < 0) {
        return items;
      }

      return arrayMove(items, oldIndex, newIndex);
    });
  };

  const handleSubmit = async () => {
    const nextErrors = buildFieldErrors(
      categoryId,
      productName,
      originalPrice,
      discountPrice,
      unitValue,
      !!mainImage || !!mainImageUrl,
    );

    setErrors(nextErrors);

    if (Object.values(nextErrors).some(Boolean) || submitting) {
      focusFirstInvalidField(nextErrors);
      return;
    }

    if (!isCreate && !product) {
      return;
    }

    setSubmitting(true);

    try {
      if (isCreate) {
        if (!mainImage) {
          setErrors((current) => ({
            ...current,
            mainImage: MAIN_IMAGE_REQUIRED_ERROR,
          }));
          focusField('mainImage');
          return;
        }

        await ProductsApi.create({
          categoryId,
          productName: normalizeProductName(productName),
          originalPrice,
          discountPrice,
          unitValue,
          unitType,
          shortDescription,
          longDescription,
          isTrending,
          tags,
          mainImage,
          galleryImages: galleryItems
            .map((item) => item.file)
            .filter(Boolean) as File[],
        });

        toast.success('Product created successfully.');
      } else {
        await ProductsApi.updateDetails(product!.id, {
          categoryId,
          productName: normalizeProductName(productName),
          originalPrice,
          discountPrice,
          shortDescription,
          longDescription,
          unitValue,
          unitType,
          tags,
          isTrending,
        });

        if (mainImage) {
          await ProductsApi.replaceMainImage(product!.id, mainImage);
        }

        const currentExistingIds = galleryItems
          .filter((item) => item.id)
          .map((item) => item.id!);

        for (const id of initialGalleryIds) {
          if (!currentExistingIds.includes(id)) {
            await ProductsApi.deleteGalleryImage(product!.id, id);
          }
        }

        let hasAddsOrDeletes =
          currentExistingIds.length !== initialGalleryIds.length ||
          initialGalleryIds.some((id) => !currentExistingIds.includes(id));

        for (const item of galleryItems) {
          if (item.file && item.id) {
            await ProductsApi.replaceGalleryImage(
              product!.id,
              item.id,
              item.file,
            );
          } else if (item.file && !item.id) {
            await ProductsApi.addGalleryImage(product!.id, item.file);
            hasAddsOrDeletes = true;
          }
        }

        const orderChanged =
          !hasAddsOrDeletes &&
          currentExistingIds.length === initialGalleryIds.length &&
          currentExistingIds.some((id, index) => id !== initialGalleryIds[index]);

        if (orderChanged) {
          await ProductsApi.reorderGalleryImages(
            product!.id,
            currentExistingIds,
          );
          toast.success('Gallery updated successfully.');
        }

        toast.success('Product updated successfully.');
      }

      onSuccess();
      forceClose();
    } catch (error: unknown) {
      const axiosError = error as {
        response?: {
          status?: number;
          data?: {
            message?: string | string[];
            errors?: Record<string, string>;
          };
        };
      };

      const fieldErrors = mapServerFieldErrors(axiosError.response?.data);

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
    }
  };

  if (!open || (!isCreate && !product)) {
    return null;
  }

  const title = isCreate ? 'Create Product' : 'Edit Product';
  const subtitleText = isCreate
    ? 'Add a new product to your catalog.'
    : `Update details for ${product?.name.value}.`;
  const submitLabel = isCreate ? 'Create Product' : 'Save Changes';

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
              aria-labelledby="product-form-title"
              className="flex max-h-[90vh] w-full max-w-[700px] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex shrink-0 items-start justify-between border-b border-border px-5 py-4 sm:px-6">
                <div>
                  <h2
                    id="product-form-title"
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
                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="product-category"
                        className="text-sm font-semibold text-foreground"
                      >
                        Category <span className="text-destructive">*</span>
                      </label>
                      <Select
                        ref={categoryRef}
                        id="product-category"
                        value={categoryId}
                        onChange={(nextValue) => {
                          setCategoryId(nextValue);
                          updateFieldError(
                            'categoryId',
                            validateCategoryId(nextValue),
                          );
                        }}
                        options={categoryOptions}
                        placeholder="Select Category"
                        hasError={!!errors.categoryId}
                        searchable
                        disabled={submitting}
                        leadingIcon={<Layers size={16} />}
                      />
                      {errors.categoryId && (
                        <p className="text-sm text-destructive">
                          {errors.categoryId}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="product-name"
                        className="text-sm font-semibold text-foreground"
                      >
                        Product Name <span className="text-destructive">*</span>
                      </label>
                      <input
                        ref={productNameRef}
                        id="product-name"
                        value={productName}
                        onChange={(event) => {
                          setProductName(event.target.value);
                          updateFieldError(
                            'productName',
                            validateProductName(event.target.value),
                          );
                        }}
                        onBlur={() => {
                          updateFieldError(
                            'productName',
                            validateProductName(productName),
                          );
                        }}
                        placeholder="e.g. Alphonso Mango"
                        className={formInputClassName(!!errors.productName)}
                      />
                      {errors.productName && (
                        <p className="text-sm text-destructive">
                          {errors.productName}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label
                          htmlFor="original-price"
                          className="text-sm font-semibold text-foreground"
                        >
                          Original Price{' '}
                          <span className="text-destructive">*</span>
                        </label>
                        <input
                          ref={originalPriceRef}
                          id="original-price"
                          type="number"
                          min="0"
                          step="0.01"
                          value={originalPrice || ''}
                          onChange={(event) => {
                            const value = Number(event.target.value);
                            setOriginalPrice(value);
                            setErrors((current) => ({
                              ...current,
                              originalPrice: validateOriginalPrice(value),
                              discountPrice: validateDiscountPrice(
                                discountPrice,
                                value,
                              ),
                            }));
                          }}
                          onBlur={() => {
                            setErrors((current) => ({
                              ...current,
                              originalPrice: validateOriginalPrice(
                                originalPrice,
                              ),
                              discountPrice: validateDiscountPrice(
                                discountPrice,
                                originalPrice,
                              ),
                            }));
                          }}
                          className={formInputClassName(!!errors.originalPrice)}
                        />
                        {errors.originalPrice && (
                          <p className="text-sm text-destructive">
                            {errors.originalPrice}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label
                          htmlFor="discount-price"
                          className="text-sm font-semibold text-foreground"
                        >
                          Discount Price
                        </label>
                        <input
                          ref={discountPriceRef}
                          id="discount-price"
                          type="number"
                          min="0"
                          step="0.01"
                          value={discountPrice || ''}
                          onChange={(event) => {
                            const value = Number(event.target.value);
                            setDiscountPrice(value);
                            setErrors((current) => ({
                              ...current,
                              discountPrice: validateDiscountPrice(
                                value,
                                originalPrice,
                              ),
                            }));
                          }}
                          onBlur={() => {
                            setErrors((current) => ({
                              ...current,
                              discountPrice: validateDiscountPrice(
                                discountPrice,
                                originalPrice,
                              ),
                            }));
                          }}
                          className={formInputClassName(!!errors.discountPrice)}
                        />
                        {errors.discountPrice && (
                          <p className="text-sm text-destructive">
                            {errors.discountPrice}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="flex gap-3">
                        <div className="flex-1 space-y-1.5">
                          <label
                            htmlFor="unit-value"
                            className="text-sm font-semibold text-foreground"
                          >
                            Unit
                          </label>
                          <input
                            ref={unitValueRef}
                            id="unit-value"
                            type="number"
                            min="1"
                            value={unitValue}
                            onChange={(event) => {
                              const value = Number(event.target.value);
                              setUnitValue(value);
                              updateFieldError(
                                'unitValue',
                                validateUnitValue(value),
                              );
                            }}
                            className={formInputClassName(!!errors.unitValue)}
                          />
                          {errors.unitValue && (
                            <p className="text-sm text-destructive">
                              {errors.unitValue}
                            </p>
                          )}
                        </div>
                        <div className="min-w-[7rem] flex-1 space-y-1.5">
                          <label
                            htmlFor="unit-type"
                            className="text-sm font-semibold text-foreground"
                          >
                            Type
                          </label>
                          <Select
                            id="unit-type"
                            value={unitType}
                            onChange={(nextValue) => {
                              setUnitType(nextValue);
                            }}
                            options={unitTypeOptions}
                            placeholder="Type"
                            disabled={submitting}
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label
                          htmlFor="product-tags"
                          className="text-sm font-semibold text-foreground"
                        >
                          Tags
                        </label>
                        <MultiSelectDropdown
                          id="product-tags"
                          values={tags}
                          onChange={(nextTags) =>
                            setTags(nextTags as ProductTag[])
                          }
                          options={tagOptions}
                          placeholder="Select tags…"
                          disabled={submitting}
                        />
                      </div>
                    </div>

                    <div className="space-y-3 rounded-2xl border border-border bg-muted/20 p-4">
                      <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-foreground">
                        <ImagePlus size={16} /> Media
                      </h3>

                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-foreground">
                          Main Image{' '}
                          {isCreate && (
                            <span className="text-destructive">*</span>
                          )}
                        </label>
                        <input
                          ref={mainImageRef}
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={handleMainImageUpload}
                        />
                        {!mainImagePreview ? (
                          <button
                            type="button"
                            onClick={() => mainImageRef.current?.click()}
                            className="flex h-40 w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-muted-foreground/25 bg-background transition-all hover:border-primary/50 hover:bg-muted"
                          >
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                              <Upload size={20} />
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-semibold text-foreground">
                                Click to upload main image
                              </p>
                              <p className="text-xs text-muted-foreground">
                                PNG, JPG, WEBP
                              </p>
                            </div>
                          </button>
                        ) : (
                          <div className="relative h-48 w-full overflow-hidden rounded-xl border border-border">
                            <img
                              src={mainImagePreview}
                              className="h-full w-full object-cover"
                              alt="Main"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setMainImage(null);
                                setMainImageUrl('');
                                if (isCreate) {
                                  setErrors((current) => ({
                                    ...current,
                                    mainImage: MAIN_IMAGE_REQUIRED_ERROR,
                                  }));
                                }
                              }}
                              className="absolute right-2 top-2 flex items-center gap-1 rounded-lg border border-destructive/20 bg-background/95 px-2 py-1.5 text-xs font-bold text-destructive shadow-sm hover:bg-destructive/10"
                            >
                              <Trash2 size={12} /> Remove
                            </button>
                            {!mainImage && (
                              <button
                                type="button"
                                onClick={() => mainImageRef.current?.click()}
                                className="absolute bottom-2 right-2 rounded-lg border border-border bg-background/95 px-2 py-1.5 text-xs font-bold shadow-sm"
                              >
                                Replace
                              </button>
                            )}
                          </div>
                        )}
                        {errors.mainImage && (
                          <p className="text-sm text-destructive">
                            {errors.mainImage}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-foreground">
                          Gallery ({galleryItems.length})
                        </label>
                        <input
                          ref={galleryInputRef}
                          type="file"
                          multiple
                          hidden
                          accept="image/*"
                          onChange={handleGalleryUpload}
                        />
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={handleGalleryDragEnd}
                        >
                          <SortableContext
                            items={galleryItems.map((item) => item.key)}
                            strategy={rectSortingStrategy}
                          >
                            <div className="grid grid-cols-4 gap-2">
                              {galleryItems.map((item, index) => (
                                <SortableGalleryItem
                                  key={item.key}
                                  item={item}
                                  preview={getGalleryPreview(item)}
                                  disabled={submitting}
                                  onRemove={() =>
                                    setGalleryItems((current) =>
                                      current.filter((_, i) => i !== index),
                                    )
                                  }
                                  onReplace={(file) =>
                                    setGalleryItems((current) => {
                                      const next = [...current];
                                      next[index] = { ...next[index], file };
                                      return next;
                                    })
                                  }
                                />
                              ))}
                              <button
                                type="button"
                                onClick={() => galleryInputRef.current?.click()}
                                className="flex aspect-square items-center justify-center rounded-lg border border-dashed border-muted-foreground/30 bg-background transition-colors hover:border-primary/50 hover:bg-muted"
                              >
                                <Plus size={20} className="text-muted-foreground" />
                              </button>
                            </div>
                          </SortableContext>
                        </DndContext>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="short-description"
                        className="text-sm font-semibold text-foreground"
                      >
                        Short Description
                      </label>
                      <input
                        id="short-description"
                        value={shortDescription}
                        onChange={(event) =>
                          setShortDescription(event.target.value)
                        }
                        className={formInputClassName(false)}
                        placeholder="Brief highlight..."
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="long-description"
                        className="text-sm font-semibold text-foreground"
                      >
                        Long Description
                      </label>
                      <textarea
                        id="long-description"
                        value={longDescription}
                        onChange={(event) =>
                          setLongDescription(event.target.value)
                        }
                        className={formTextareaClassName(false)}
                        placeholder="Detailed product information..."
                      />
                    </div>

                    {isCreate && (
                      <button
                        type="button"
                        onClick={() => setIsTrending((current) => !current)}
                        className="flex w-full items-center gap-4 rounded-xl border border-border bg-muted/20 p-4 text-left transition-all hover:bg-muted/40"
                      >
                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded-md border-2 transition-colors ${
                            isTrending
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-muted-foreground/30 bg-background'
                          }`}
                        >
                          {isTrending && <Check size={14} strokeWidth={3} />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">
                            Mark as Trending
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Product will be highlighted in the storefront.
                          </p>
                        </div>
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center justify-end gap-3 border-t border-border px-5 py-4 sm:px-6">
                  <button
                    type="button"
                    onClick={requestClose}
                    disabled={submitting}
                    className="rounded-xl border border-input px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting && (
                      <Loader2 size={16} className="animate-spin" />
                    )}
                    {submitting
                      ? isCreate
                        ? 'Creating...'
                        : 'Saving...'
                      : submitLabel}
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
