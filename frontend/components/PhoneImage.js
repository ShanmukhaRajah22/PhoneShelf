"use client";

import { useEffect, useState } from "react";
import { getImageUrl } from "../lib/api";

export default function PhoneImage({ imageKey, alt }) {
  const [imageUrl, setImageUrl] = useState("");
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isCurrent = true;
    setImageUrl("");
    setHasError(false);

    if (!imageKey) return undefined;
    if (/^https?:\/\//i.test(imageKey)) {
      setImageUrl(imageKey);
      return undefined;
    }

    getImageUrl(imageKey)
      .then((response) => {
        if (isCurrent) setImageUrl(response.data.url);
      })
      .catch(() => {
        if (isCurrent) setHasError(true);
      });

    return () => {
      isCurrent = false;
    };
  }, [imageKey]);

  if (imageUrl && !hasError) {
    return (
      <img
        className="h-full w-full object-cover"
        src={imageUrl}
        alt={alt}
        onError={() => setHasError(true)}
      />
    );
  }

  return (
    <div className="flex h-full min-h-48 items-center justify-center bg-neutral-100 px-4 text-center text-xs uppercase tracking-[0.2em] text-neutral-400">
      {imageKey && !hasError ? "Loading image" : "No image"}
    </div>
  );
}
