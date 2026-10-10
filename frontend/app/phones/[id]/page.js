"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { deletePhone, getPhone } from "../../../lib/api";
import PhoneImage from "../../../components/PhoneImage";
import SpecificationsTable from "../../../components/SpecificationsTable";
import { ErrorState, LoadingState } from "../../../components/StatusMessage";

export default function PhoneDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [phone, setPhone] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    getPhone(id)
      .then((response) => setPhone(response.data))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setIsLoading(false));
  }, [id]);

  async function handleDelete() {
    if (
      !window.confirm(
        `Delete ${phone.brand} ${phone.model}? This cannot be undone.`,
      )
    )
      return;
    setIsDeleting(true);
    try {
      await deletePhone(id);
      router.push("/");
      router.refresh();
    } catch (requestError) {
      setError(requestError.message);
      setIsDeleting(false);
    }
  }

  if (isLoading) return <LoadingState label="Loading phone..." />;
  if (error)
    return (
      <ErrorState message={error} onRetry={() => window.location.reload()} />
    );
  if (!phone) return <ErrorState message="Phone not found." />;

  return (
    <div>
      <Link className="text-sm text-neutral-500 hover:text-black" href="/">
        ← Back to catalog
      </Link>
      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="aspect-[4/3] overflow-hidden border border-neutral-200">
          <PhoneImage
            imageKey={phone.imageKey}
            alt={`${phone.brand} ${phone.model}`}
          />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
            {phone.brand}
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight">
            {phone.model}
          </h1>
          <p className="mt-4 text-2xl">
            ${Number(phone.price).toLocaleString()}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="button-primary" href={`/phones/${id}/edit`}>
              Edit phone
            </Link>
            <button
              className="button-secondary"
              disabled={isDeleting}
              onClick={handleDelete}
            >
              {isDeleting ? "Deleting..." : "Delete phone"}
            </button>
          </div>
        </div>
      </div>
      <section className="mt-12">
        <h2 className="mb-4 text-xl font-semibold">Specifications</h2>
        <SpecificationsTable specifications={phone.specifications} />
      </section>
    </div>
  );
}
