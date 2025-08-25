// api.js
const API_URL = 'https://script.google.com/macros/s/AKfycbwCtJCFG2FHHEZeJ7Sc2pMG2_QXRhuXjFsXLYCSSXOUBG7cnjtRjK51V1pWCfKkt5KA/exec';

function encodeForm(data) {
  return Object.keys(data)
    .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(data[k]))
    .join('&');
}

async function doPostRequestForm(payload, errorMsg) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: encodeForm(payload),
  });

  if (!res.ok) throw new Error(`${errorMsg}: ${res.status} ${res.statusText}`);
  return await res.json();
}



// async function doPostRequestForm(payload, errorMsg) {
//   const res = await fetch(API_URL, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
//     body: encodeForm(payload),
//   });
//   if (!res.ok) {
//     throw new Error(`${errorMsg}: ${res.status} ${res.statusText}`);
//   }
//   return await res.json();
// }

export async function fetchPosts({ signal } = {}) {
  const res = await fetch(API_URL, { signal });
  if (!res.ok) throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  const json = await res.json();
  console.log("json", json)
  return Array.isArray(json?.data) ? json.data : [];
}
export async function createPost({ title, content, image_base64 }) {
  return doPostRequestForm(
    { action: 'create', title, content, image_base64 },
    'Create failed'
  );
}


// export async function createPost({ title, content, image_base64 }) {
//   console.log("title, content, imageBase64", title, content, image_base64)
//   return doPostRequestForm(
//     { action: 'create', title, content, image_base64 },
//     'Create failed'
//   );
// }

export async function updatePost({ id, title, content, image_base64 }) {
  return doPostRequestForm(
    { action: 'update', id, title, content, image_base64 },
    'Update failed'
  );
}

export async function deletePost({ id }) {
  return doPostRequestForm({ action: 'delete', id }, 'Delete failed');
}

// --- Helper: convert file -> Base64 ---
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = reader.result.split(',')[1]; // chỉ lấy phần Base64
      resolve(base64);                            // trả về raw Base64, sẽ được encode bởi encodeForm
    };
    reader.onerror = reject;
  });
}

export { API_URL };
