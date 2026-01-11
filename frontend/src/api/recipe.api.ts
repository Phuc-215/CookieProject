import api from './axios';

import type { RecipeDetail, RecipeFormData } from '@/types/Recipe';

export const getDetailApi = (recipeId: string | number) =>
  api.get<{ recipes: RecipeDetail }>(`/recipes/${recipeId}`);

export const createRecipeApi = (
  data: RecipeFormData,
  mainImageFile?: File | null
) => {
  const formData = new FormData();

  /* ===== Basic fields ===== */
  formData.append('title', data.title);
  formData.append('description', data.description);
  formData.append('difficulty', data.difficulty);

  if (data.category) {
    formData.append('category', data.category);
  }

  if (data.cookTime !== null) {
    formData.append('cookTime', String(data.cookTime));
  }

  if (data.servings !== null) {
    formData.append('servings', String(data.servings));
  }

  /* ===== Main image ===== */
  if (mainImageFile instanceof File) {
    formData.append('mainImage', mainImageFile);
  }

  /* ===== Ingredients ===== */
  formData.append('ingredients', JSON.stringify(data.ingredients));

  /* ===== Steps (metadata only, images handled separately if needed) ===== */
  const stepsMetadata = data.steps.map(step => ({
    id: step.id,
    description: step.description,
    stepNumber: step.stepNumber,
  }));
  formData.append('steps', JSON.stringify(stepsMetadata));

  return api.post<{ recipe: RecipeFormData }>(
    '/recipes/create',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
};

export const saveRecipeApi = (
  id: string | null,
  data: RecipeFormData,
  mainImageFile?: File | null,
  stepImageFiles?: Record<number, File[]>
) => {
  const formData = new FormData();

  if (id) {
    formData.append('recipeId', id);
  }

  if (mainImageFile instanceof File) {
    formData.append('mainImage', mainImageFile);
  }

  data.steps.forEach((step, index) => {
    const newImages = (step as any)._newImages as File[] | undefined;

    if (!newImages?.length) return;

    newImages.forEach(file => {
      if (file instanceof File) {
        // MUST match backend: step_${i}_images
        formData.append(`step_${index}_images`, file);
      }
    });
  });

  formData.append('title', data.title);
  formData.append('description', data.description);
  formData.append('difficulty', data.difficulty);

  if (data.category) {
    formData.append('category', data.category);
  }

  if (data.cookTime !== null) {
    formData.append('cookTime', String(data.cookTime));
  }

  if (data.servings !== null) {
    formData.append('servings', String(data.servings));
  }

  formData.append('ingredients', JSON.stringify(data.ingredients));
  formData.append('steps', JSON.stringify(
    data.steps.map(({ _newImages, ...step }) => ({
        id: step.id,
        description: step.description,
        stepNumber: step.stepNumber,
        imageUrls: step.image_urls,
      }))
  ));

  return api.put(`/recipes/save`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};