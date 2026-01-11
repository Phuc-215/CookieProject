import { useState, useRef, ChangeEvent } from 'react';
import { Upload, Plus } from 'lucide-react';
import { PixelButton } from '@/components/PixelButton';
import { PixelInput } from '@/components/PixelInput';
import { PixelTextarea } from '@/components/PixelTextarea';
import { PixelTag } from '@/components/PixelTag';
import { useNav } from '@/hooks/useNav';

import {DndContext,closestCenter,PointerSensor,useSensor,useSensors,DragEndEvent} from '@dnd-kit/core';
import {SortableContext,verticalListSortingStrategy,arrayMove} from '@dnd-kit/sortable';

import { StepItem, RecipeStep } from '@/components/StepItem';

/* ================= TYPES ================= */

interface Ingredient {
  id: string;
  name: string;
  quantity: string;
}

const MAX_STEP_IMAGES = 5;

/* ================= COMPONENT ================= */

export function CreateRecipe() {
  const nav = useNav();

  /* ===== BASIC INFO ===== */
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] =
    useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [category, setCategory] =
    useState<'Dessert' | 'Main' | 'Drink' | 'Snack'>('Dessert');
  const [cookTime, setCookTime] = useState('');
  const [servings, setServings] = useState('');
  const [mainImage, setMainImage] = useState<string | null>(null);

  /* ===== INGREDIENTS ===== */
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [newIngredientName, setNewIngredientName] = useState('');
  const [newIngredientQuantity, setNewIngredientQuantity] = useState('');

  /* ===== STEPS ===== */
  const [steps, setSteps] = useState<RecipeStep[]>([
    { id: '1', instruction: '', images: [] },
  ]);

  /* ===== DND ===== */
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  /* ================= HANDLERS ================= */

  /* ----- INGREDIENT ----- */
  const handleAddIngredient = () => {
    if (!newIngredientName || !newIngredientQuantity) return;

    setIngredients(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        name: newIngredientName,
        quantity: newIngredientQuantity,
      },
    ]);

    setNewIngredientName('');
    setNewIngredientQuantity('');
  };

  const handleRemoveIngredient = (id: string) =>
    setIngredients(prev => prev.filter(i => i.id !== id));

  /* ----- STEP ----- */
  const handleAddStep = () =>
    setSteps(prev => [
      ...prev,
      { id: Date.now().toString(), instruction: '', images: [] },
    ]);

  const handleRemoveStep = (id: string) =>
    setSteps(prev => prev.filter(s => s.id !== id));

  const handleUpdateStepInstruction = (id: string, value: string) =>
    setSteps(prev =>
      prev.map(s => (s.id === id ? { ...s, instruction: value } : s))
    );

  const handleUploadStepImages = (id: string, files: FileList | null) => {
    if (!files) return;

    setSteps(prev =>
      prev.map(s => {
        if (s.id !== id) return s;

        const remain = MAX_STEP_IMAGES - s.images.length;
        if (remain <= 0) return s;

        const newImages = Array.from(files)
          .slice(0, remain)
          .map(f => URL.createObjectURL(f));

        return { ...s, images: [...s.images, ...newImages] };
      })
    );
  };

  const handleRemoveStepImage = (stepId: string, image: string) =>
    setSteps(prev =>
      prev.map(s =>
        s.id === stepId
          ? { ...s, images: s.images.filter(i => i !== image) }
          : s
      )
    );

  const handleReorderStepImages = (
    stepId: string,
    activeId: string,
    overId: string
  ) =>
    setSteps(prev =>
      prev.map(s => {
        if (s.id !== stepId) return s;

        return {
          ...s,
          images: arrayMove(
            s.images,
            s.images.indexOf(activeId),
            s.images.indexOf(overId)
          ),
        };
      })
    );

  const handleReorderSteps = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setSteps(prev =>
      arrayMove(
        prev,
        prev.findIndex(s => s.id === active.id),
        prev.findIndex(s => s.id === over.id)
      )
    );
  };

  /* ----- MAIN IMAGE ----- */
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMainImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setMainImage(URL.createObjectURL(file));
  };

  /* ================= RENDER ================= */

  return (
    <div className="min-h-screen bg-[var(--background-image)]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="pixel-card bg-white p-8">

          <h2
            className="text-lg mb-8"
            style={{ fontFamily: "'Press Start 2P', cursive" }}
          >
            Create New Recipe
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
              className="aspect-video pixel-border bg-[#FFF8E1] flex flex-col items-center justify-center cursor-pointer relative overflow-hidden"
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
          </div>

          {/* BASIC INFO */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="md:col-span-2">
              <PixelInput
                label="Recipe Title *"
                placeholder="e.g. Classic Red Velvet Cake"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <PixelTextarea
                label="Description"
                placeholder="Short description about your recipe..."
                rows={4}
                value={description}
                onChange={e => setDescription(e.target.value)}
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
                    className={`flex-1 py-3 pixel-border text-sm uppercase ${
                      difficulty === level
                        ? 'bg-[#5D4037] text-white'
                        : 'bg-white hover:bg-[#FFF8E1]'
                    }`}
                    onClick={() => setDifficulty(level)}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <PixelInput
              label="Servings"
              placeholder="e.g. 2 slices"
              value={servings}
              onChange={e => setServings(e.target.value)}
            />

            {/* Category */}
            <div>
              <label className="block mb-2 uppercase text-sm tracking-wide">
                Category *
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full px-3 py-3 pixel-border bg-white uppercase text-sm"
              >
                <option value="Dessert">Dessert</option>
                <option value="Main">Main Dish</option>
                <option value="Drink">Drink</option>
                <option value="Snack">Snack</option>
              </select>
            </div>

            <PixelInput
              label="Cook Time"
              placeholder="e.g. 12 mins"
              value={cookTime}
              onChange={e => setCookTime(e.target.value)}
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

            <div className="pixel-border bg-white p-4 min-h-[100px]">
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
          </div>

          {/* ACTIONS */}
          <div className="flex gap-4 pt-6 border-t-[3px] border-[#5D4037]">
            <PixelButton variant="outline" className="flex-1" onClick={nav.home}>
              Save Draft
            </PixelButton>
            <PixelButton variant="secondary" className="flex-1" onClick={nav.home}>
              Publish Recipe
            </PixelButton>
          </div>

        </div>
      </div>
    </div>
  );
}