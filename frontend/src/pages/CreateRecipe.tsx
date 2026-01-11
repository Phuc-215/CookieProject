import { useState, useRef, ChangeEvent } from 'react';
import { Upload, Camera, X, Plus } from 'lucide-react';
import { PixelButton } from '../components/PixelButton';
import { PixelInput } from '../components/PixelInput';
import { PixelTextarea } from '../components/PixelTextarea';
import { PixelTag } from '../components/PixelTag';
import { useNav } from '@/hooks/useNav';
import {DndContext, closestCenter, DragEndEvent, PointerSensor, useSensor, useSensors,} from '@dnd-kit/core';
import {SortableContext, useSortable, verticalListSortingStrategy, arrayMove} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface RecipeStep {
  id: string;
  instruction: string;
  images: string[];
}

interface Ingredient {
  id: string;
  name: string;
  quantity: string;
}

const MAX_STEP_IMAGES = 5;

function SortableStep({stepId,children}: {
  stepId: string;
  children: (listeners: any) => React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: stepId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {children(listeners)}
    </div>
  );
}

function SortableImage({id,src,onRemove,}: {
  id: string;
  src: string;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative w-24 h-24 pixel-border overflow-hidden cursor-grab active:cursor-grabbing"
    >
      <img src={src} className="w-full h-full object-cover pointer-events-none" />

      <button
        onClick={onRemove}
        className="absolute top-1 right-1 bg-white pixel-border p-1 hover:bg-red-400"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}


export function CreateRecipe() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [category, setCategory] = useState<'Dessert' | 'Main' | 'Drink' | 'Snack'>('Dessert');
  const [cookTime, setCookTime] = useState('');
  const [servings, setServings] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: '1', name: 'Flour', quantity: '2 cups' },
    { id: '2', name: 'Sugar', quantity: '1 cup' },
    { id: '3', name: 'Butter', quantity: '1/2 cup' },
  ]);
  const [newIngredientName, setNewIngredientName] = useState('');
  const [newIngredientQuantity, setNewIngredientQuantity] = useState('');
  const [steps, setSteps] = useState<RecipeStep[]>([
    { id: '1', instruction: 'Preheat oven to 350°F (175°C)', images: []},
    { id: '2', instruction: 'Mix dry ingredients in a large bowl', images: []},
  ]);
  const [mainImage, setMainImage] = useState<string | null>(null);

  const nav = useNav();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // kéo chuột 5px mới kích hoạt drag
      },
    })
  );

  const handleAddIngredient = () => {
    if (newIngredientName.trim() && newIngredientQuantity.trim()) {
      const newIngredient: Ingredient = {
        id: Date.now().toString(),
        name: newIngredientName.trim(),
        quantity: newIngredientQuantity.trim(),
      };
      setIngredients([...ingredients, newIngredient]);
      setNewIngredientName('');
      setNewIngredientQuantity('');
    }
  };

  const handleRemoveIngredient = (id: string) => {
    setIngredients(ingredients.filter(i => i.id !== id));
  };

  const handleAddStep = () => {
    const newStep: RecipeStep = {
      id: Date.now().toString(),
      instruction: '',
      images: [],
    };
    setSteps([...steps, newStep]);
  };

  const handleStepImageUpload = (stepId: string, files: FileList | null) => {
    if (!files) return;

    setSteps(prev =>
      prev.map(step => {
        if (step.id !== stepId) return step;

        const remain = MAX_STEP_IMAGES - step.images.length;
        if (remain <= 0) return step;

        const newImages = Array.from(files)
          .slice(0, remain)
          .map(file => URL.createObjectURL(file));

        return {
          ...step,
          images: [...step.images, ...newImages],
        };
      })
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setSteps((prev) => {
      const oldIndex = prev.findIndex(s => s.id === active.id);
      const newIndex = prev.findIndex(s => s.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const handleRemoveStepImage = (stepId: string, img: string) => {
    setSteps(prev =>
      prev.map(step =>
        step.id === stepId
          ? { ...step, images: step.images.filter(i => i !== img) }
          : step
      )
    );
  };

  const handleReorderStepImages = ( stepId: string, activeId: string, overId: string
  ) => {
    setSteps(prev =>
      prev.map(step => {
        if (step.id !== stepId) return step;

        const oldIndex = step.images.indexOf(activeId);
        const newIndex = step.images.indexOf(overId);

        if (oldIndex === -1 || newIndex === -1) return step;

        return {
          ...step,
          images: arrayMove(step.images, oldIndex, newIndex),
        };
      })
    );
  };

  const handleRemoveStep = (id: string) => {
    setSteps(steps.filter(s => s.id !== id));
  };

  const handleUpdateStep = (id: string, instruction: string) => {
    setSteps(steps.map(s => s.id === id ? { ...s, instruction } : s));
  };

  //File Upload
  // 1. Create a ref for the hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 2. Handle the click on the pixel box to trigger the hidden input
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  // 3. Handle the file selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a URL for preview immediately
      const imageUrl = URL.createObjectURL(file);
      setMainImage(imageUrl);
      
      // Note: In a real app, you would typically upload 'file' to a server here 
      // (e.g., AWS S3, Cloudinary) and get a real URL back.
    }
  };

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

          {/* Main Image Upload */}
          <div className="mb-8">
            <label className="block mb-3 uppercase text-sm tracking-wide">
              Main Recipe Image *
            </label>
            
            {/* HIDDEN INPUT */}
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden" 
              accept="image/png, image/jpeg, image/jpg"
            />

            <div 
              className="aspect-video pixel-border bg-[#FFF8E1] flex flex-col items-center justify-center cursor-pointer hover:bg-[#FFF8E1]/70 transition-colors relative overflow-hidden"
              onClick={handleImageClick}
            >
              {mainImage ? (
                <>
                  <img src={mainImage} alt="Recipe" className="w-full h-full object-cover" />
                  {/* Overlay to indicate you can change it */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="bg-white px-2 py-1 font-vt323 text-xs border border-black">Change Image</span>
                  </div>
                </>
              ) : (
                <>
                  <Upload className="w-12 h-12 text-[#5D4037]/30 mb-3" />
                  <p className="text-sm text-[#5D4037]/70 uppercase">Click to upload image</p>
                  <p className="text-xs text-[#5D4037]/50 mt-1">PNG, JPG up to 10MB</p>
                </>
              )}
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="md:col-span-2">
              <PixelInput
                label="Recipe Title *"
                placeholder="e.g., Classic Chocolate Chip Cookies"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <PixelTextarea
                label="Description"
                placeholder="Tell us about your recipe..."
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-2 uppercase text-sm tracking-wide">
                Difficulty *
              </label>
              <div className="flex gap-2">
                {(['Easy', 'Medium', 'Hard'] as const).map((level) => (
                  <button
                    key={level}
                    className={`flex-1 py-3 pixel-border text-sm uppercase transition-colors ${
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

            <div>
              <PixelInput
                label="Servings"
                placeholder="e.g., 12 cookies"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-2 uppercase text-sm tracking-wide">
                Category *
              </label>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-3 pixel-border bg-white uppercase text-sm focus:outline-none focus:shadow-[0_0_0_3px_var(--brown)]"
              >
                <option value="Dessert">Dessert</option>
                <option value="Main">Main Dish</option>
                <option value="Drink">Drink</option>
                <option value="Snack">Snack</option>
              </select>
            </div>

            <div>
              <PixelInput
                label="Cook Time"
                placeholder="e.g., 30 min"
                value={cookTime}
                onChange={(e) => setCookTime(e.target.value)}
              />
            </div>
          </div>

          {/* Ingredients */}
          <div className="mb-8">
            <label className="block mb-3 uppercase text-sm tracking-wide">
              Ingredients *
            </label>
            
            <div className="flex gap-2 mb-4">
              <PixelInput
                placeholder="Add an ingredient..."
                value={newIngredientName}
                onChange={(e) => setNewIngredientName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddIngredient();
                  }
                }}
              />
              <PixelInput
                placeholder="Quantity..."
                value={newIngredientQuantity}
                onChange={(e) => setNewIngredientQuantity(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddIngredient();
                  }
                }}
              />
              <PixelButton variant="secondary" onClick={handleAddIngredient}>
                <Plus className="w-4 h-4" />
              </PixelButton>
            </div>

            <div className="pixel-border bg-white p-4 min-h-[100px]">
              {ingredients.length === 0 ? (
                <p className="text-sm text-[#5D4037]/50 text-center py-4">No ingredients added yet</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {ingredients.map((ingredient) => (
                    <PixelTag
                      key={ingredient.id}
                      label={`${ingredient.name} - ${ingredient.quantity}`}
                      variant="green"
                      removable
                      onRemove={() => handleRemoveIngredient(ingredient.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Steps */}
          <div className="mb-8">
            <label className="block mb-3 uppercase text-sm tracking-wide">
              Instructions *
            </label>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={steps.map(s => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {steps.map((step, index) => (
                    <SortableStep key={step.id} stepId={step.id}>
                      {(listeners) => (
                        <div className="pixel-card bg-[#FFF8E1] p-4">
                          <div className="flex items-start gap-3">
                            
                            {/* DRAG HANDLE */}
                            <div
                              {...listeners}
                              className="w-8 h-8 pixel-border bg-[#5D4037] text-white flex items-center justify-center shrink-0 mt-2 cursor-grab active:cursor-grabbing"
                                title="Drag to reorder"
                            >
                              {index + 1}
                            </div>

                            <div className="flex-1">
                              <textarea
                                className="w-full px-3 py-2 pixel-border bg-white text-[#5D4037] placeholder:text-[#5D4037]/50 resize-none mb-3 focus:shadow-[0_0_0_3px_var(--brown)] focus:outline-none transition-shadow"
                                rows={3}
                                placeholder="Describe this step..."
                                value={step.instruction}
                                onChange={(e) =>
                                  handleUpdateStep(step.id, e.target.value)
                                }
                              />

                              {/* Hidden input */}
                              <input
                                type="file"
                                multiple
                                accept="image/*"
                                className="hidden"
                                id={`step-upload-${step.id}`}
                                onChange={(e) =>
                                  handleStepImageUpload(step.id, e.target.files)
                                }
                              />

                              <button
                                disabled={step.images.length >= MAX_STEP_IMAGES}
                                className={`px-3 py-2 pixel-border text-sm uppercase flex items-center gap-2 transition-colors
                                  ${
                                    step.images.length >= MAX_STEP_IMAGES
                                      ? 'bg-gray-300 cursor-not-allowed'
                                      : 'bg-white hover:bg-[#4DB6AC]'
                                  }
                                `}
                                onClick={() =>
                                  document
                                    .getElementById(`step-upload-${step.id}`)
                                    ?.click()
                                }
                              >
                                <Camera className="w-4 h-4" />
                                {step.images.length >= MAX_STEP_IMAGES
                                  ? 'Max Images'
                                  : 'Add Step Photos'}
                              </button>
                              <div
                                className={`mt-1 text-xs ${
                                  step.images.length === MAX_STEP_IMAGES
                                    ? 'text-red-500'
                                    : 'text-[#5D4037]/70'
                                }`}
                              >
                                {step.images.length} / {MAX_STEP_IMAGES} images
                              </div>

                              {/* Preview images */}
                              {step.images.length > 0 && (
                                <DndContext
                                  sensors={sensors}
                                  collisionDetection={closestCenter}
                                  onDragEnd={(event) => {
                                    const { active, over } = event;
                                    if (!over || active.id === over.id) return;

                                    handleReorderStepImages(
                                      step.id,
                                      active.id as string,
                                      over.id as string
                                    );
                                  }}
                                >
                                  <SortableContext
                                    items={step.images}
                                    strategy={verticalListSortingStrategy}
                                  >
                                    <div className="mt-3 flex flex-wrap gap-2">
                                      {step.images.map((img) => (
                                        <SortableImage
                                          key={img}
                                          id={img}
                                          src={img}
                                          onRemove={() => handleRemoveStepImage(step.id, img)}
                                        />
                                      ))}
                                    </div>
                                  </SortableContext>
                                </DndContext>
                              )}

                            </div>

                            {/* REMOVE STEP */}
                            <button
                              className="p-2 hover:bg-white/50 transition-colors"
                              onClick={() => handleRemoveStep(step.id)}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </SortableStep>
                  ))}

                  <PixelButton
                    variant="outline"
                    className="w-full"
                    onClick={handleAddStep}
                  >
                    <Plus className="w-4 h-4 inline mr-2" />
                    Add Step
                  </PixelButton>
                </div>
              </SortableContext>
            </DndContext>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t-[3px] border-[#5D4037]">
            <PixelButton variant="outline" className="flex-1" onClick={() => nav.home()}>
              Save Draft
            </PixelButton>
            <PixelButton variant="secondary" className="flex-1" onClick={() => nav.home()}>
              Publish Recipe
            </PixelButton>
          </div>
        </div>
      </div>
    </div>
  );
}