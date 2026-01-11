import { ChangeEvent } from 'react';
import { Camera, X } from 'lucide-react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent} from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { RecipeStep } from '@/types/Recipe';

const MAX_STEP_IMAGES = 5;

/* ================= TYPES ================= */

interface StepItemProps {
  step: RecipeStep;
  index: number;

  onUpdateInstruction: (id: string, value: string) => void;
  onUploadImages: (id: string, files: FileList | null) => void;
  onRemoveImage: (stepId: string, image: string) => void;
  onReorderImages: (stepId: string, activeId: string, overId: string) => void;
  onRemoveStep: (id: string) => void;
}

/* ================= SORTABLE IMAGE ================= */

function SortableImage({
  id,
  src,
  onRemove,
}: {
  id: string;
  src: string;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className="relative w-24 h-24 pixel-border overflow-hidden cursor-grab active:cursor-grabbing"
    >
      <img
        src={src}
        className="w-full h-full object-cover pointer-events-none"
      />

      <button
        onClick={onRemove}
        className="absolute top-1 right-1 bg-white pixel-border p-1 hover:bg-red-400"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

/* ================= STEP ITEM ================= */

export function StepItem({
  step,
  index,
  onUpdateInstruction,
  onUploadImages,
  onRemoveImage,
  onReorderImages,
  onRemoveStep,
}: StepItemProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  console.log("STEP: ", step);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: step.id });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className="pixel-card bg-[#FFF8E1] p-4"
    >
      <div className="flex items-start gap-3">
        {/* DRAG HANDLE */}
        <div
          {...listeners}
          className="w-8 h-8 pixel-border bg-[#5D4037] text-white flex items-center justify-center shrink-0 mt-2 cursor-grab active:cursor-grabbing"
          title="Drag to reorder"
        >
          {index + 1}
        </div>

        {/* CONTENT */}
        <div className="flex-1">
          {/* INSTRUCTION */}
          <textarea
            rows={3}
            value={step.description}
            placeholder="Describe this step..."
            onChange={(e) =>
              onUpdateInstruction(step.id, e.target.value)
            }
            className="w-full px-3 py-2 pixel-border bg-white text-[#5D4037] placeholder:text-[#5D4037]/50 resize-none mb-3 focus:shadow-[0_0_0_3px_var(--brown)] focus:outline-none"
          />

          {/* IMAGE UPLOAD */}
          <input
            type="file"
            multiple
            accept="image/*"
            id={`step-upload-${step.id}`}
            className="hidden"
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onUploadImages(step.id, e.target.files)
            }
          />

          <button
            disabled={
              step.image_urls?.length >= MAX_STEP_IMAGES ||
              step.description.trim().length === 0
            }
            onClick={() =>
              document
                .getElementById(`step-upload-${step.id}`)
                ?.click()
            }
            className={`px-3 py-2 pixel-border text-sm uppercase flex items-center gap-2 transition-colors
              ${
                step.image_urls?.length >= MAX_STEP_IMAGES ||
                step.description.trim().length === 0
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-white hover:bg-[#4DB6AC]'
              }
            `}
            title={
              step.description.trim().length === 0
                ? 'Please add a description first'
                : step.image_urls?.length >= MAX_STEP_IMAGES
                ? 'Maximum images reached'
                : 'Add step photos'
            }
          >
            <Camera className="w-4 h-4" />
            {step.image_urls?.length >= MAX_STEP_IMAGES
              ? 'Max Images'
              : step.description.trim().length === 0
              ? 'Add Description First'
              : 'Add Step Photos'}
          </button>

          <div
            className={`mt-1 text-xs ${
              step.image_urls?.length === MAX_STEP_IMAGES
                ? 'text-red-500'
                : 'text-[#5D4037]/70'
            }`}
          >
            {step.image_urls?.length} / {MAX_STEP_IMAGES} images
          </div>

          {/* IMAGE PREVIEW + SORT */}
          {step.image_urls?.length > 0 && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={(event: DragEndEvent) => {
                const { active, over } = event;
                if (!over || active.id === over.id) return;

                onReorderImages(
                  step.id,
                  active.id as string,
                  over.id as string
                );
              }}
            >
              <SortableContext
                items={step.image_urls}
                strategy={verticalListSortingStrategy}
              >
                <div className="mt-3 flex flex-wrap gap-2">
                  {step.image_urls?.map((img) => (
                    <SortableImage
                      key={img}
                      id={img}
                      src={img}
                      onRemove={() =>
                        onRemoveImage(step.id, img)
                      }
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>

        {/* REMOVE STEP */}
        <button
          onClick={() => onRemoveStep(step.id)}
          className="p-2 hover:bg-white/50 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}