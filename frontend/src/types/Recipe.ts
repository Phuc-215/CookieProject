export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Recipe {
  id: string;
  title: string;
  image: string;
  author: string;
  difficulty: Difficulty;
  time: string;
  likes: number;
  isLiked?: boolean;
  isSaved?: boolean;
}