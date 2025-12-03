import { useNavigate } from "react-router-dom";

export function useNav() {
  const n = useNavigate();

  return {
    go: (p: string) => n(p),
    back: () => n(-1),
    home: () => n("/"),
    login: () => n("/login"),
    signup: () => n("/signup"),
    search: () => n("/search"),
    me: () => n("/me"),
    editProfile: () => n("/edit-profile"),
    profile: (id: string | number) => n(`/profile/${id}`),
    create: () => n("/create"),
    notifications: () => n("/notifications"),
    recipe: (id: string | number) => n(`/recipe/${id}`),
  };
}
