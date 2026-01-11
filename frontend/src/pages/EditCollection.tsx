import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Globe, Lock, Loader2 } from "lucide-react";

import { PixelButton } from "@/components/PixelButton";
import { PixelInput } from "@/components/PixelInput";
import { PixelTextarea } from "@/components/PixelTextarea";
import { useNav } from "@/hooks/useNav";

import { 
  createCollectionApi, 
  updateCollectionApi, 
  deleteCollectionApi, 
  getCollectionDetailApi 
} from "@/api/collection.api";
import { useToastContext } from "@/contexts/ToastContext";

type JarVisibility = "public" | "private";

type Mode = "edit" | "create";

export function EditCollection({ mode = "edit" }: { mode?: Mode }) {
  const nav = useNav();
  const { id } = useParams<{ id: string }>();
  const { success, error: showError } = useToastContext();

  /* ===== State ===== */
  const [jarName, setJarName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<JarVisibility>("private");

  const [isLoading, setIsLoading] = useState(false); // For fetching initial data
  const [isSubmitting, setIsSubmitting] = useState(false); // For saving/deleting
  const [error, setError] = useState<string | null>(null);

  const [initialData, setInitialData] = useState({
    jarName: "",
    description: "",
    visibility: "private" as JarVisibility,
  });

  useEffect(() => {
    if (mode === "create") return;
    if (!id) {
      setError("No Collection ID provided");
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await getCollectionDetailApi(id);
        const data = res.data.data;

        // Map Backend Data to Frontend State
        const fetchedName = data.title;
        const fetchedDesc = data.description || "";
        const fetchedVis = data.is_private ? "private" : "public";

        // Set Form State
        setJarName(fetchedName);
        setDescription(fetchedDesc);
        setVisibility(fetchedVis);

        // Set Snapshot for change detection
        setInitialData({
          jarName: fetchedName,
          description: fetchedDesc,
          visibility: fetchedVis,
        });

      } catch (err: any) {
        console.error(err);
        setError("Failed to load collection details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [mode, id]);

  /* ===== Detect changes ===== */
  const isChanged = useMemo(() => {
    return (
      jarName.trim().length > 0 &&
      (jarName !== initialData.jarName ||
       description !== initialData.description ||
       visibility !== initialData.visibility)
    );
  }, [jarName, description, visibility, initialData, mode]);

  /* ===== Handlers ===== */
  const handleSave = async () => {
    if (!jarName.trim()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        title: jarName,
        description: description,
        isPrivate: visibility === "private",
      };

      if (mode === "edit" && id) {
        await updateCollectionApi(id, payload);
        success("Cookie Jar updated!");
      } else {
        await createCollectionApi(payload);
        success("Cookie Jar created!");
      }
      
      nav.back();
    } catch (err: any) {
      console.error(err);
      showError(err.response?.data?.message || "Failed to save collection");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!confirm("Are you sure you want to delete this cookie jar? This cannot be undone.")) {
      return;
    }

    setIsSubmitting(true);
    try {
      await deleteCollectionApi(id);
      success("Cookie Jar deleted");
      nav.back();
    } catch (err: any) {
      console.error(err);
      showError("Failed to delete collection");
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background-image)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#5D4037]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background-image)]">

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="pixel-card bg-white p-8">
          {/* Submitting Overlay */}
          {isSubmitting && (
            <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#5D4037]" />
            </div>
          )}

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