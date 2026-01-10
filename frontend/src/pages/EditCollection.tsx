import { useMemo, useState } from "react";
import { Globe, Lock } from "lucide-react";

import { PixelButton } from "@/components/PixelButton";
import { PixelInput } from "@/components/PixelInput";
import { PixelTextarea } from "@/components/PixelTextarea";
import { useNav } from "@/hooks/useNav";

type JarVisibility = "public" | "private";

type Mode = "edit" | "create";

export function EditCollection({ mode = "edit" }: { mode?: Mode }) {
  const nav = useNav();

  /* ===== Initial values (mock – sau này thay bằng API) ===== */
  const initialState = mode === "edit"
    ? {
        jarName: "My Cookie Jar",
        description: "Tell us about your collection...",
        visibility: "private" as JarVisibility,
      }
    : {
        jarName: "",
        description: "",
        visibility: "private" as JarVisibility,
      };

  /* ===== State ===== */
  const [jarName, setJarName] = useState(initialState.jarName);
  const [description, setDescription] = useState(initialState.description);
  const [visibility, setVisibility] = useState<JarVisibility>(
    initialState.visibility
  );

  /* ===== Detect changes ===== */
  const isChanged = useMemo(() => {
    return (
      jarName !== initialState.jarName ||
      description !== initialState.description ||
      visibility !== initialState.visibility
    );
  }, [jarName, description, visibility]);

  /* ===== Handlers ===== */
  const handleSave = () => {
    if (mode === "edit") {
      alert("Cookie Jar updated!");
    } else {
      alert("Cookie Jar created!");
    }
    nav.back();
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this cookie jar?")) {
      alert("Cookie Jar deleted");
      nav.back();
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background-image)]">

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="pixel-card bg-white p-8">
          {/* ===== Title ===== */}
          <h2
            className="text-sm mb-10"
            style={{ fontFamily: "'Press Start 2P'" }}
          >
            {mode === "edit" ? "Edit Cookie Jar" : "Create Cookie Jar"}
          </h2>

          {/* ===== Visibility ===== */}
          <div className="mb-10">
            <label className="block text-sm mb-4 uppercase text-[#5D4037]/70">
              Setting
            </label>

            <div className="flex gap-4">
              <PixelButton
                variant={visibility === "public" ? "primary" : "outline"}
                size="md"
                onClick={() => setVisibility("public")}
              >
                <span className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Public
                </span>
              </PixelButton>

              <PixelButton
                variant={visibility === "private" ? "secondary" : "outline"}
                size="md"
                onClick={() => setVisibility("private")}
              >
                <span className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Private
                </span>
              </PixelButton>
            </div>
          </div>

          {/* ===== Jar Name ===== */}
          <div className="mb-8">
            <label className="block text-sm mb-3 uppercase text-[#5D4037]/70">
              Jar's Name
            </label>

            <PixelInput
              value={jarName}
              onChange={(e) => setJarName(e.target.value)}
              placeholder="Cookie jar's name"
            />
          </div>

          {/* ===== Description ===== */}
          <div className="mb-10">
            <label className="block text-sm mb-3 uppercase text-[#5D4037]/70">
              Description
            </label>

            <PixelTextarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us about your collection..."
              rows={4}
              maxLength={150}
            />

            <p className="text-xs text-[#5D4037]/50 mt-2">
              Brief description for your collection. Max 150 characters.
            </p>
          </div>

          {/* ===== Actions ===== */}
          <div className="flex gap-3 pt-6 border-t-[3px] border-[#5D4037]">
            <PixelButton
              variant="outline"
              size="md"
              onClick={() => nav.back()}
            >
              Cancel
            </PixelButton>

            {mode === "edit" && (
              <PixelButton
                variant="destructive"
                size="md"
                onClick={handleDelete}
              >
                Delete
              </PixelButton>
            )}

            <PixelButton
              variant="primary"
              size="md"
              onClick={handleSave}
              disabled={mode === "edit" && !isChanged}
              className={mode === "edit" && !isChanged ? "opacity-50 cursor-not-allowed" : ""}
            >
              {mode === "edit" ? "Save Changes" : "Create Jar"}
            </PixelButton>
          </div>
        </div>
      </div>
    </div>
  );
}