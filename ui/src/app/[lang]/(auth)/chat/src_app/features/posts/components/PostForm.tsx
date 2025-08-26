import React, { useEffect, useState } from "react";
import { fileToBase64 } from "../api";

export type UpdatePostPayload = {
  id: string | number;
  title: string;
  content: string;
  image_base64: string;
};

interface PostFormProps {
  initialValue?: {
    id?: number | string;
    title?: string;
    content?: string;
    image_url?: string;
  } | null;
  onCancel: () => void;
  onSubmit: (payload: UpdatePostPayload) => void;
}

export default function PostForm({
  initialValue = null,
  onCancel,
  onSubmit,
}: PostFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(""); // hiển thị ảnh preview
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (initialValue) {
      setTitle(initialValue.title ?? "");
      setContent(initialValue.content ?? "");
      setImagePreview(initialValue.image_url ?? "");
    } else {
      setTitle("");
      setContent("");
      setImagePreview("");
    }
  }, [initialValue]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUploading(true);
    const payload: UpdatePostPayload = {
      id: initialValue?.id ?? "none",
      title: title.trim(),
      content: content.trim(),
      image_base64: initialValue?.image_url ?? "keep",
    };

    if (initialValue?.id != null) payload.id = initialValue.id;

    if (imageFile) {
      try {
        const base64 = await fileToBase64(imageFile);
        payload.image_base64 = base64;
      } catch (err) {
        console.error("Failed to convert image:", err);
        alert("Failed to read image file");
        setUploading(false);
        return;
      }
    }
    console.log("payload", payload);
    onSubmit?.(payload);
    setUploading(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 space-y-3 p-4 rounded-lg border border-[color:var(--border)] bg-[color:var(--panel)]"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {initialValue ? "Edit Post" : "Add Post"}
        </h2>
      </div>

      <div className="grid gap-3">
        <label className="grid gap-1">
          <span className="text-sm text-[color:var(--muted)]">Title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md border border-[color:var(--border)] bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
            placeholder="Enter title"
            required
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm text-[color:var(--muted)]">Content</span>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full rounded-md border border-[color:var(--border)] bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-[color:var(--accent)] min-h-[100px]"
            placeholder="Write content..."
            required
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm text-[color:var(--muted)]">Image</span>
          {imagePreview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imagePreview}
              alt="preview"
              className="w-24 h-24 object-cover mb-2 rounded"
            />
          )}
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={(e) => {
              const files = e.target.files;
              const file = files && files[0] ? files[0] : null;
              setImageFile(file);
              setImagePreview(file ? URL.createObjectURL(file) : "");
            }}
          />
        </label>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          className="rounded-md bg-[color:var(--accent)] px-4 py-2 text-black font-medium hover:opacity-90"
          disabled={uploading}
        >
          {initialValue ? "Update" : "Create"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-[color:var(--border)] px-4 py-2 hover:bg-[color:var(--row)]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
