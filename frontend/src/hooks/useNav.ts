import { useNavigate } from "react-router-dom";

export function useNav() {
  const n = useNavigate();

  return {
    go: (p: string) => n(p),
    back: () => n(-1),
    home: () => n("/"),
    login: () => n("/login"),
    signup: () => n("/signup"),
    search: (q?: string) => q ? n(`/search?q=${encodeURIComponent(q)}`) : n("/search"),
    me: () => n("/me"),
    editProfile: () => n("/edit-profile"),
    profile: (id: string | number) => n(`/profile/${id}`),
    create: () => n("/create"),
    editRecipe: (id: string | number) => n(`/edit/${id}`),
    notifications: () => n("/notifications"),
    recipe: (id: string | number) => n(`/recipe/${id}`),
    collection: (id: string | number) => n(`/collections/${id}`),
    editCollection: (id: string | number) => n(`/edit-collection/${id}`),
    createCollection: () => n("/collections/new"),
  };
}
