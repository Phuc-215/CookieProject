import { Collection } from "@/types/Collection";

export const MOCK_COLLECTIONS: Collection[] = [
  {
    id: "col-1",
    title: "Pixel Desserts",
    ownerUsername: "SweetChef",
    description: "abc...",
    coverImages: [
      'https://images.unsplash.com/photo-1499636136210-6f4ee915583e',
      'https://images.unsplash.com/photo-1506224772180-d75b3efbe9be',
    ],
    recipeIds: ["1", "2"],
    recipeCount: 2,
  },
  {
    id: "col-2",
    title: "Quick & Easy Treats",
    ownerUsername: "ChocMaster",
    description: "xyz...",
    coverImages: [
      "https://images.unsplash.com/photo-1617996884841-3949eaec3448?w=600",
    ],
    recipeIds: ["2", "3"],
    recipeCount: 2,
  },
];
