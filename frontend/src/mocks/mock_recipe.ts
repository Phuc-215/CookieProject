import { Recipe } from "@/types/Recipe";

export const MOCK_RECIPES: Recipe[] = [
  {
    id: "1",
    title: "Rainbow Macarons",
    image: "https://images.unsplash.com/photo-1580421383318-f87fc861a696?w=600",
    author: "SweetChef",
    difficulty: "Hard" as const,
    time: "120 min",
    likes: 523,
    isLiked: false,
    isSaved: false,
  },
  {
    id: "2",
    title: "Fudgy Brownies",
    image: "https://images.unsplash.com/photo-1617996884841-3949eaec3448?w=600",
    author: "ChocMaster",
    difficulty: "Easy" as const,
    time: "35 min",
    likes: 678,
    isLiked: true,
    isSaved: false,
  },
  {
    id: "3",
    title: "Pixel Perfect Cookie",
    image: "https://images.unsplash.com/photo-1703118834585-67fd82bdefdd?w=600",
    author: "PixelBaker",
    difficulty: "Medium" as const,
    time: "50 min",
    likes: 891,
    isLiked: false,
    isSaved: true,
  },
];