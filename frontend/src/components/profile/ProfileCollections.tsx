import { CollectionCard } from '@/components/CollectionCard';
// import { useNav } from '@/hooks/useNav';
import type { Collection } from '@/types/Collection';

interface ProfileCollectionsProps {
  collections: Collection[];
  isOwner: boolean;
}

export function ProfileCollections({
  collections,
  isOwner,
}: ProfileCollectionsProps) {
  // const nav = useNav();

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {collections.map((col) => (
        <CollectionCard
          key={col.id}
          {...col}
          // onClick={() => nav.collection(col.id)}
          showEdit={isOwner}
          showDelete={isOwner}
        />
      ))}
    </div>
  );
}