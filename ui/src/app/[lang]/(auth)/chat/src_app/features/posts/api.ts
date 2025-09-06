// api.js
const API_URL =
  "https://script.google.com/macros/s/AKfycbwpBLrhLs_7PhPnq4ZcjNLA46DrmwvH6Tmt5gPzLMt57oC8qjx-aFMjCbU3pALR1ceu/exec";

// https://script.google.com/macros/s/AKfycbwD5x23NazY1_u5ZVsTsJl7I-2mI5KeAjBMb9X7hokocJgFOhME5rXgQEPJaJHO4ITy/exec?action=services

function encodeForm(
  data: Record<string, string | number | boolean | undefined | null>
) {
  return Object.keys(data)
    .map((k) => encodeURIComponent(k) + "=" + encodeURIComponent(data[k] ?? ""))
    .join("&");
}

async function doPostRequestForm(
  payload: Record<string, string | number | boolean | undefined | null>,
  errorMsg: string
) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: encodeForm(payload),
  });

  if (!res.ok) throw new Error(`${errorMsg}: ${res.status} ${res.statusText}`);
  return await res.json();
}

type Post = {
  id: string | number;
  title: string;
  content: string;
  image_base64: string;
};


export async function fetchPosts({ signal }: { signal?: AbortSignal } = {}) {
  const res = await fetch(API_URL, { signal });
  if (!res.ok)
    throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  const json = await res.json();
  console.log("json", json);
  return Array.isArray(json?.data) ? json.data : [];
}

export type CreatePostPayload = {
  title: string;
  content: string;
  image_base64: string;
};

export async function createPost({
  title,
  content,
  image_base64,
}: CreatePostPayload) {
  return doPostRequestForm(
    { action: "create", title, content, image_base64 },
    "Create failed"
  );
}

// export async function createPost({ title, content, image_base64 }) {
//   console.log("title, content, imageBase64", title, content, image_base64)
//   return doPostRequestForm(
//     { action: 'create', title, content, image_base64 },
//     'Create failed'
//   );
// }

export async function updatePost({ id, title, content, image_base64 }: Post) {
  return doPostRequestForm(
    { action: "update", id, title, content, image_base64 },
    "Update failed"
  );
}

export async function deletePost({ id }: { id: string | number }) {
  return doPostRequestForm({ action: "delete", id }, "Delete failed");
}

// --- Helper: convert file -> Base64 ---
export function fileToBase64(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === "string") {
        const base64 = reader.result.split(",")[1];
        resolve(base64);
      } else {
        reject(new Error("FileReader result is not a string"));
      }
    };
    reader.onerror = reject;
  });
}

export { API_URL };
