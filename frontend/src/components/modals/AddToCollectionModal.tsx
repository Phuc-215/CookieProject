import { PixelModal } from '@/components/modals/PixelModal';
import { PixelButton } from "@/components/PixelButton";
import { useNav } from '@/hooks/useNav';

interface CookieJar {
  id: string;
  name: string;
  color: string;
}

interface Props {
  onClose: () => void;
  onAdd: (jarId: string) => void;
}

const MOCK_JARS: CookieJar[] = [
  { id: "1", name: "French Pastries", color: "#4DB6AC" },
  { id: "2", name: "COOOOKIE", color: "#FF8FAB" },
  { id: "3", name: "All about cupcakes", color: "#4DB6AC" },
  { id: "4", name: "CHOCO CHOCO ITEMS", color: "#FF8FAB" },
];

export function AddToCollectionModal({ onClose, onAdd }: Props) {
  const nav = useNav()
  return (
    <PixelModal title="COOKIE JARS" onClose={onClose} width="420px">
      <div className="space-y-4">
        {MOCK_JARS.map((jar) => (
          <div
            key={jar.id}
            className="flex items-center justify-between pixel-border p-3"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-6 h-6 pixel-border"
                style={{ backgroundColor: jar.color }}
              />
              <span className="text-sm uppercase">{jar.name}</span>
            </div>

            <PixelButton
              size="sm"
              variant="outline"
              onClick={() => onAdd(jar.id)}
            >
              Add
            </PixelButton>
          </div>
        ))}

        <div className="flex justify-center pt-2">
          <PixelButton
            variant="outline"
            size="md"
            onClick={() => {
              onClose();
              nav.createCollection();
            }}
          >
            + Create new cookie jar
          </PixelButton>
        </div>
      </div>
    </PixelModal>
  );
}