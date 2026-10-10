"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PhoneForm from "../../../../components/PhoneForm";
import { getPhone } from "../../../../lib/api";
import { ErrorState, LoadingState } from "../../../../components/StatusMessage";

export default function EditPhonePage() {
  const { id } = useParams();
  const [phone, setPhone] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getPhone(id)
      .then((response) => setPhone(response.data))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) return <LoadingState label="Loading phone details..." />;
  if (error) return <ErrorState message={error} />;
  if (!phone) return <ErrorState message="Phone not found." />;

  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
        Catalog entry
      </p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight">
        Edit {phone.brand} {phone.model}
      </h1>
      <p className="mt-3 mb-10 text-sm text-neutral-600">
        Update the information stored for this phone.
      </p>
      <PhoneForm phone={phone} />
    </div>
  );
}
