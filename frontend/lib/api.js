const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

async function request(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
  } catch (error) {
    throw new Error(
      "Unable to reach the PhoneShelf API. Is the backend running?",
    );
  }

  let body;
  try {
    body = await response.json();
  } catch (error) {
    throw new Error("The API returned an invalid response.");
  }

  if (!response.ok || body.success === false) {
    throw new Error(
      body.error?.message || "The request could not be completed.",
    );
  }

  return body;
}

export function getPhones(page = 1, limit = 12) {
  return request(`/api/phones?page=${page}&limit=${limit}`);
}

export function getPhone(id) {
  return request(`/api/phones/${encodeURIComponent(id)}`);
}

export function createPhone(phone) {
  return request("/api/phones", {
    method: "POST",
    body: JSON.stringify(phone),
  });
}

export function updatePhone(id, phone) {
  return request(`/api/phones/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(phone),
  });
}

export function deletePhone(id) {
  return request(`/api/phones/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function uploadPhoneImage(file) {
  const presignResponse = await request("/api/uploads/presign", {
    method: "POST",
    body: JSON.stringify({
      contentType: file.type,
      contentLength: file.size,
    }),
  });

  let uploadResponse;
  try {
    uploadResponse = await fetch(presignResponse.data.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
  } catch (error) {
    throw new Error("Unable to upload the image to S3.");
  }

  if (!uploadResponse.ok) {
    throw new Error("S3 rejected the image upload.");
  }

  return presignResponse.data.key;
}

export function getImageUrl(imageKey) {
  return request(`/api/uploads/url?key=${encodeURIComponent(imageKey)}`);
}

export function comparePhones(phoneAId, phoneBId) {
  return request("/api/phones/compare", {
    method: "POST",
    body: JSON.stringify({ phoneAId, phoneBId }),
  });
}
