import empty_my_hamster from "@/assets/empty_my_hamster.svg";
import empty_others_hamster from "@/assets/empty_others_hamster.svg";

interface ProfileEmptyStateProps {
  isOwner: boolean;
  tab: 'recipes' | 'drafts';
}

export function ProfileEmptyState({ isOwner, tab }: ProfileEmptyStateProps) {
  if (isOwner) {
    return (
      <div className="pixel-card bg-white p-10 text-center">
        <img
          src={empty_my_hamster} 
          alt="Empty kitchen"
          className="mx-auto mb-6 w-40"
        />
        <p className="text-sm opacity-80">
          Nothing in your kitchen yet — your first recipe is waiting to be created! 🍪
        </p>
      </div>
    );
  }

  return (
    <div className="pixel-card bg-white p-10 text-center">
      <img
        src={empty_others_hamster}
        alt="No recipes"
        className="mx-auto mb-6 w-40"
      />
      <p className="text-sm opacity-80">
        🥣 No recipes here, but something sweet is on the way!
      </p>
    </div>
  );
}