"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPhone, updatePhone, uploadPhoneImage } from "../lib/api";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const specificationFields = [
  ["display", "Display"],
  ["processor", "Processor"],
  ["RAM", "RAM"],
  ["storage", "Storage"],
  ["battery", "Battery"],
  ["camera", "Camera"],
  ["operatingSystem", "Operating system"],
];

function initialValues(phone) {
  return {
    brand: phone?.brand || "",
    model: phone?.model || "",
    price: phone?.price ?? "",
    imageKey: phone?.imageKey ?? null,
    specifications: Object.fromEntries(
      specificationFields.map(([key]) => [
        key,
        phone?.specifications?.[key] || "",
      ]),
    ),
  };
}

function validate(values) {
  const errors = {};
  if (!values.brand.trim()) errors.brand = "Brand is required.";
  if (!values.model.trim()) errors.model = "Model is required.";
  if (
    values.price === "" ||
    Number.isNaN(Number(values.price)) ||
    Number(values.price) < 0
  ) {
    errors.price = "Enter a valid non-negative price.";
  }

  const specificationErrors = {};
  specificationFields.forEach(([key, label]) => {
    if (!values.specifications[key].trim())
      specificationErrors[key] = `${label} is required.`;
  });
  if (Object.keys(specificationErrors).length)
    errors.specifications = specificationErrors;
  return errors;
}

function toPayload(values) {
  const payload = {
    brand: values.brand.trim(),
    model: values.model.trim(),
    price: Number(values.price),
    specifications: Object.fromEntries(
      specificationFields.map(([key]) => [
        key,
        values.specifications[key].trim(),
      ]),
    ),
  };
  if (values.imageKey) payload.imageKey = values.imageKey;
  return payload;
}

export default function PhoneForm({ phone }) {
  const router = useRouter();
  const isEditing = Boolean(phone);
  const [values, setValues] = useState(() => initialValues(phone));
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    if (name.startsWith("specifications.")) {
      const key = name.split(".")[1];
      setValues((current) => ({
        ...current,
        specifications: { ...current.specifications, [key]: value },
      }));
    } else {
      setValues((current) => ({ ...current, [name]: value }));
    }
    setSubmitError("");
  }

  async function handleImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setSubmitError("Choose a JPEG, PNG, WebP, or GIF image.");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setSubmitError("Images must be 5 MB or smaller.");
      return;
    }

    setIsUploading(true);
    setSubmitError("");
    try {
      const imageKey = await uploadPhoneImage(file);
      setValues((current) => ({ ...current, imageKey }));
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setIsSubmitting(true);
    setSubmitError("");
    try {
      const response = isEditing
        ? await updatePhone(phone._id, toPayload(values))
        : await createPhone(toPayload(values));
      router.push(`/phones/${response.data._id}`);
      router.refresh();
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-8" onSubmit={handleSubmit} noValidate>
      {submitError && (
        <div
          className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {submitError}
        </div>
      )}
      <section className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-medium">
          Brand
          <input
            className="field mt-2"
            name="brand"
            value={values.brand}
            onChange={updateField}
          />
          {errors.brand && (
            <span className="mt-1 block text-xs text-red-700">
              {errors.brand}
            </span>
          )}
        </label>
        <label className="text-sm font-medium">
          Model
          <input
            className="field mt-2"
            name="model"
            value={values.model}
            onChange={updateField}
          />
          {errors.model && (
            <span className="mt-1 block text-xs text-red-700">
              {errors.model}
            </span>
          )}
        </label>
        <label className="text-sm font-medium">
          Price
          <input
            className="field mt-2"
            name="price"
            type="number"
            min="0"
            step="0.01"
            value={values.price}
            onChange={updateField}
          />
          {errors.price && (
            <span className="mt-1 block text-xs text-red-700">
              {errors.price}
            </span>
          )}
        </label>
        <div className="text-sm font-medium">
          <label htmlFor="phone-image">
            Phone image{" "}
            <span className="font-normal text-neutral-500">
              (optional, max 5 MB)
            </span>
          </label>
          <input
            id="phone-image"
            className="field mt-2"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleImageChange}
            disabled={isUploading || isSubmitting}
          />
          {isUploading && (
            <p className="mt-2 text-xs text-neutral-500">Uploading image...</p>
          )}
          {values.imageKey && !isUploading && (
            <div className="mt-2 flex items-center justify-between gap-3 text-xs text-neutral-600">
              <span className="truncate">Image uploaded</span>
              <button
                type="button"
                className="underline hover:text-black"
                onClick={() =>
                  setValues((current) => ({ ...current, imageKey: null }))
                }
              >
                Remove image
              </button>
            </div>
          )}
        </div>
      </section>
      <section>
        <h2 className="mb-4 text-lg font-semibold">Specifications</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          {specificationFields.map(([key, label]) => (
            <label key={key} className="text-sm font-medium">
              {label}
              <input
                className="field mt-2"
                name={`specifications.${key}`}
                value={values.specifications[key]}
                onChange={updateField}
              />
              {errors.specifications?.[key] && (
                <span className="mt-1 block text-xs text-red-700">
                  {errors.specifications[key]}
                </span>
              )}
            </label>
          ))}
        </div>
      </section>
      <div className="flex flex-col gap-3 border-t border-neutral-200 pt-6 sm:flex-row">
        <button
          className="button-primary"
          disabled={isSubmitting || isUploading}
          type="submit"
        >
          {isSubmitting
            ? "Saving..."
            : isEditing
              ? "Save changes"
              : "Add phone"}
        </button>
        <button
          className="button-secondary"
          type="button"
          onClick={() => router.back()}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
