import api from './axios';

import type { Category } from '@/types/Category';

export const getCategoriesListApi = () =>
  api.get<{categories: Category[]}>(`/category/list`);