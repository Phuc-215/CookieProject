type ProfileTab = 'recipes' | 'collections' | 'drafts';

interface ProfileTabsProps {
  isOwner: boolean;
  activeTab: ProfileTab;
  onChange: (tab: ProfileTab) => void;
}

export function ProfileTabs({
  isOwner,
  activeTab,
  onChange,
}: ProfileTabsProps) {
  const baseClass =
    'px-4 py-2 uppercase text-sm border-[3px] border-b-0';
  const activeClass = 'bg-white';
  const inactiveClass = 'opacity-60 hover:opacity-100';

  const tabClass = (tab: ProfileTab) =>
    `${baseClass} ${activeTab === tab ? activeClass : inactiveClass}`;

  return (
    <div className="mb-6 flex gap-2 border-b-[3px]">
      <button
        className={tabClass('recipes')}
        onClick={() => onChange('recipes')}
      >
        Recipes
      </button>

      <button
        className={tabClass('collections')}
        onClick={() => onChange('collections')}
      >
        Collections
      </button>

      {isOwner && (
        <button
          className={tabClass('drafts')}
          onClick={() => onChange('drafts')}
        >
          Drafts
        </button>
      )}
    </div>
  );
}
