import { useRef, ChangeEvent, useEffect, useMemo, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Upload, Plus } from 'lucide-react';
import { PixelButton } from '@/components/PixelButton';
import { PixelInput } from '@/components/PixelInput';
import { PixelTextarea } from '@/components/PixelTextarea';
import { PixelTag } from '@/components/PixelTag';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';

import { StepItem } from '@/components/StepItem';
import { RecipeFormData} from '@/types/Recipe';
import { Category } from '@/types/Category';

interface Props {
  mode: 'create' | 'edit';
  initialData?: RecipeFormData;
  onSaveDraft: (data: RecipeFormData) => void;
  onPublish: (data: RecipeFormData) => void;
  categories: Category[];
  loading?: boolean;
}

const MAX_STEP_IMAGES = 5;

/* ================= COMPONENT ================= */

export function RecipeForm({
  mode,
  initialData,
  onSaveDraft,
  onPublish,
  categories,
  loading = false,
}: Props) {
  /* ===== FORM STATE ===== */
  // Form state management
  const {
    register,
    watch,
    setValue,
    getValues,
    reset,
  } = useForm<RecipeFormData>({
    defaultValues: {
      title: '',
      description: '',
      difficulty: 'Medium',
      category: '',
      cookTime: '',
      servings: '',
      mainImage: null,
      ingredients: [],
      steps: [{ id: '1', instruction: '', images: [] }],
    },
  });

  // Watch form values (for validation and display)
  const title = watch('title');
  const difficulty = watch('difficulty');
  const category = watch('category');
  const mainImage = watch('mainImage');
  const ingredients = watch('ingredients');
  const steps = watch('steps');

  // Temporary input state for adding new ingredients
  const [newIngredientName, setNewIngredientName] = useState('');
  const [newIngredientQuantity, setNewIngredientQuantity] = useState('');

  // Track which fields have been touched by the user / ユーザーが触れたフィールドを追跡
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  /* ===== INIT EDIT DATA ===== */
  useEffect(() => {
    if (!initialData) return;
    reset(initialData);
  }, [initialData, reset]);

  /* ===== DND ===== */
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  /* ===== INGREDIENT ===== */
  const handleAddIngredient = () => {
    if (!newIngredientName || !newIngredientQuantity) return;

    markFieldTouched('ingredients');
    const currentIngredients = getValues('ingredients');
    setValue('ingredients', [
      ...currentIngredients,
      {
        id: Date.now().toString(),
        name: newIngredientName,
        quantity: newIngredientQuantity,
      },
    ]);

    setNewIngredientName('');
    setNewIngredientQuantity('');
  };

  const handleRemoveIngredient = (id: string) => {
    markFieldTouched('ingredients');
    const currentIngredients = getValues('ingredients');
    setValue(
      'ingredients',
      currentIngredients.filter(i => i.id !== id)
    );
  };

  /* ===== STEP ===== */
  const handleAddStep = () => {
    markFieldTouched('steps');
    const currentSteps = getValues('steps');
    setValue('steps', [
      ...currentSteps,
      { id: Date.now().toString(), instruction: '', images: [] },
    ]);
  };

  const handleRemoveStep = (id: string) => {
    markFieldTouched('steps');
    const currentSteps = getValues('steps');
    setValue('steps', currentSteps.filter(s => s.id !== id));
  };

  const handleUpdateStepInstruction = (id: string, value: string) => {
    markFieldTouched('steps');
    const currentSteps = getValues('steps');
    setValue(
      'steps',
      currentSteps.map(s => (s.id === id ? { ...s, instruction: value } : s))
    );
  };

  const handleUploadStepImages = (id: string, files: FileList | null) => {
    if (!files) return;

    const currentSteps = getValues('steps');
    const step = currentSteps.find(s => s.id === id);
    
    // Don't allow image upload if step has no description
    if (!step || step.instruction.trim().length === 0) return;

    setValue(
      'steps',
      currentSteps.map(s => {
        if (s.id !== id) return s;

        const remain = MAX_STEP_IMAGES - s.images.length;
        const newImages = Array.from(files)
          .slice(0, remain)
          .map(f => URL.createObjectURL(f));

        return { ...s, images: [...s.images, ...newImages] };
      })
    );
  };

  const handleRemoveStepImage = (stepId: string, image: string) => {
    const currentSteps = getValues('steps');
    setValue(
      'steps',
      currentSteps.map(s =>
        s.id === stepId
          ? { ...s, images: s.images.filter(i => i !== image) }
          : s
      )
    );
  };

  const handleReorderStepImages = (
    stepId: string,
    activeId: string,
    overId: string
  ) => {
    const currentSteps = getValues('steps');
    setValue(
      'steps',
      currentSteps.map(s =>
        s.id === stepId
          ? {
              ...s,
              images: arrayMove(
                s.images,
                s.images.indexOf(activeId),
                s.images.indexOf(overId)
              ),
            }
          : s
      )
    );
  };

  const handleReorderSteps = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const currentSteps = getValues('steps');
    setValue(
      'steps',
      arrayMove(
        currentSteps,
        currentSteps.findIndex(s => s.id === active.id),
        currentSteps.findIndex(s => s.id === over.id)
      )
    );
  };

  /* ===== MAIN IMAGE ===== */
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleMainImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    markFieldTouched('mainImage');
    const file = e.target.files?.[0];
    if (file) setValue('mainImage', URL.createObjectURL(file));
  };

  /* ===== SUBMIT ===== */
  const buildData = (): RecipeFormData => getValues();

  /* ===== VALIDATION ===== */
  // Validation function: Compute errors with given touched fields set
  const computeValidationErrors = useCallback(
    (fieldsToCheck: Set<string>): Record<string, string> => {
      const errors: Record<string, string> = {};

      // Only show errors for checked fields
      if (fieldsToCheck.has('title') && title.trim().length === 0) {
        errors.title = 'Recipe title is required';
      }

      if (fieldsToCheck.has('mainImage') && mainImage === null) {
        errors.mainImage = 'Main recipe image is required';
      }

      if (fieldsToCheck.has('category') && (!category || category.trim().length === 0)) {
        errors.category = 'Category is required';
      }

      if (fieldsToCheck.has('ingredients') && ingredients.length === 0) {
        errors.ingredients = 'At least one ingredient is required';
      }

      if (fieldsToCheck.has('steps')) {
        if (steps.length === 0) {
          errors.steps = 'At least one step is required';
        } else {
          // Each step must have a description
          const stepsWithoutDescription = steps.filter(
            step => step.instruction.trim().length === 0
          );
          if (stepsWithoutDescription.length > 0) {
            errors.steps = 'All steps must have a description';
          }
        }
      }

      return errors;
    },
    [title, mainImage, category, ingredients.length, steps]
  );

  //Validation: Check required fields and minimum requirements
  const validationErrors = useMemo(() => {
    return computeValidationErrors(touchedFields);
  }, [computeValidationErrors, touchedFields]);

  // Helper to mark field as touched
  const markFieldTouched = (fieldName: string) => {
    setTouchedFields(prev => new Set(prev).add(fieldName));
  };

  // Check actual form validity (always validate all fields, not just touched ones)
  const isValid = useMemo(() => {
    const allFieldsTouched = new Set([
      'title',
      'mainImage',
      'ingredients',
      'steps',
      'category',
    ]);
    const errors = computeValidationErrors(allFieldsTouched);
    return Object.keys(errors).length === 0;
  }, [computeValidationErrors]);

  /* ================= RENDER ================= */

  return (
    <div className="min-h-screen bg-[var(--background-image)]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="pixel-card bg-white p-8">
        <h2 className="text-lg mb-8 font-['Press_Start_2P']">
          {mode === 'create' ? 'Create New Recipe' : 'Edit Recipe'}
        </h2>

            {/* MAIN IMAGE */}
            <div className="mb-8">
              <label className="block mb-3 uppercase text-sm tracking-wide">
                Main Recipe Image *
              </label>

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleMainImageChange}
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className={`aspect-video pixel-border bg-[#FFF8E1] flex flex-col items-center justify-center cursor-pointer relative overflow-hidden ${
                  validationErrors.mainImage
                    ? 'border-pink-500 shadow-[0_0_0_3px_#f9a8d4]'
                    : ''
                }`}
              >
                {mainImage ? (
                  <>
                    <img src={mainImage} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="bg-white px-2 py-1 font-vt323 text-xs border border-black">
                        Change Image
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-[#5D4037]/30 mb-3" />
                    <p className="text-sm text-[#5D4037]/70 uppercase">
                      Click to upload image
                    </p>
                    <p className="text-xs text-[#5D4037]/50 mt-1">
                      PNG, JPG up to 10MB
                    </p>
                  </>
                )}
              </div>
              {validationErrors.mainImage && (
                <p className="mt-2 text-sm text-pink-500">
                  {validationErrors.mainImage}
                </p>
              )}
            </div>

            {/* BASIC INFO */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="md:col-span-2">
                <PixelInput
                  label="Recipe Title *"
                  placeholder="e.g. Classic Red Velvet Cake"
                  error={validationErrors.title || null}
                  {...register('title', {
                    onChange: () => markFieldTouched('title'),
                  })}
                />
                {validationErrors.title && (
                  <p className="mt-1 text-sm text-pink-500">
                    {validationErrors.title}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <PixelTextarea
                  label="Description"
                  placeholder="Short description about your recipe..."
                  rows={4}
                  {...register('description')}
                />
              </div>

              {/* Difficulty */}
              <div>
                <label className="block mb-2 uppercase text-sm tracking-wide">
                  Difficulty *
                </label>
                <div className="flex gap-2">
                  {(['Easy', 'Medium', 'Hard'] as const).map(level => (
                    <button
                      key={level}
                      type="button"
                      className={`flex-1 py-3 pixel-border text-sm uppercase ${
                        difficulty === level
                          ? 'bg-[#5D4037] text-white'
                          : 'bg-white hover:bg-[#FFF8E1]'
                      }`}
                      onClick={() => setValue('difficulty', level)}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <PixelInput
                label="Servings"
                placeholder="e.g. 2 slices"
                {...register('servings')}
              />

              {/* Category */}
              <div>
                <label className="block mb-2 uppercase text-sm tracking-wide">
                  Category *
                </label>
                <select
                  {...register('category', { required: true, onChange: () => markFieldTouched('category') })}
                  className="w-full px-3 py-3 pixel-border bg-white uppercase text-sm"
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.name}>{category.name}</option>
                  ))}
                </select>
                {validationErrors.category && (
                  <p className="mt-1 text-sm text-pink-500">
                    {validationErrors.category}
                  </p>
                )}
              </div>

              <PixelInput
                label="Cook Time"
                placeholder="e.g. 12 mins"
                {...register('cookTime')}
              />
            </div>

            {/* INGREDIENTS */}
            <div className="mb-8">
              <label className="block mb-3 uppercase text-sm tracking-wide">
                Ingredients *
              </label>

              <div className="flex gap-2 mb-4">
                <PixelInput
                  placeholder="Name: e.g. Flour"
                  value={newIngredientName}
                  onChange={e => setNewIngredientName(e.target.value)}
                />
                <PixelInput
                  placeholder="Quantity: e.g. 200g"
                  value={newIngredientQuantity}
                  onChange={e => setNewIngredientQuantity(e.target.value)}
                />
                <PixelButton variant="secondary" onClick={handleAddIngredient}>
                  <Plus className="w-4 h-4" />
                </PixelButton>
              </div>

              <div
                className={`pixel-border bg-white p-4 min-h-[100px] ${
                  validationErrors.ingredients
                    ? 'border-pink-500 shadow-[0_0_0_3px_#f9a8d4]'
                    : ''
                }`}
              >
                <div className="flex flex-wrap gap-2">
                  {ingredients.map(i => (
                    <PixelTag
                      key={i.id}
                      label={`${i.name} - ${i.quantity}`}
                      removable
                      variant="green"
                      onRemove={() => handleRemoveIngredient(i.id)}
                    />
                  ))}
                </div>
              </div>
              {validationErrors.ingredients && (
                <p className="mt-2 text-sm text-pink-500">
                  {validationErrors.ingredients}
                </p>
              )}
            </div>

            {/* STEPS */}
            <div className="mb-8">
              <label className="block mb-3 uppercase text-sm tracking-wide">
                Instructions *
              </label>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleReorderSteps}
              >
                <SortableContext
                  items={steps.map(s => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4">
                    {steps.map((step, index) => (
                      <StepItem
                        key={step.id}
                        step={step}
                        index={index}
                        onUpdateInstruction={handleUpdateStepInstruction}
                        onUploadImages={handleUploadStepImages}
                        onRemoveImage={handleRemoveStepImage}
                        onReorderImages={handleReorderStepImages}
                        onRemoveStep={handleRemoveStep}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              <PixelButton
                variant="outline"
                className="w-full mt-4"
                onClick={handleAddStep}
              >
                + Add Step
              </PixelButton>
              {validationErrors.steps && (
                <p className="mt-2 text-sm text-pink-500">
                  {validationErrors.steps}
                </p>
              )}
            </div>

        {/* ==== ACTIONS ==== */}
        <div className="flex gap-4 pt-6 border-t-[3px] border-[#5D4037]">
          <PixelButton
            variant="outline"
            className="flex-1"
            onClick={() => onSaveDraft(buildData())}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Draft'}
          </PixelButton>
          <PixelButton
            variant="secondary"
            className="flex-1"
            onClick={() => {
              // Mark all required fields as touched to show all errors
              const allFieldsTouched = new Set(touchedFields);
              allFieldsTouched.add('title');
              allFieldsTouched.add('mainImage');
              allFieldsTouched.add('category');
              allFieldsTouched.add('ingredients');
              allFieldsTouched.add('steps');
              
              setTouchedFields(allFieldsTouched);
              
              // Check validation with all fields touched
              const errors = computeValidationErrors(allFieldsTouched);
              const isFormValid = Object.keys(errors).length === 0;
              
              if (isFormValid) {
                onPublish(buildData());
              }
            }}
            disabled={!isValid || loading}
          >
            {loading
              ? 'Publishing...'
              : mode === 'create'
              ? 'Publish Recipe'
              : 'Update Recipe'}
          </PixelButton>
        </div>
      </div>
    </div>
    </div>
  );
}