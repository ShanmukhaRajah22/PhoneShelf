"use client";

import { useEffect, useState } from "react";
import { comparePhones, getPhones } from "../../lib/api";
import PhoneImage from "../../components/PhoneImage";
import SpecificationsTable from "../../components/SpecificationsTable";
import {
  ErrorState,
  EmptyState,
  LoadingState,
} from "../../components/StatusMessage";

const categories = [
  ["performance", "Performance"],
  ["display", "Display"],
  ["battery", "Battery"],
  ["camera", "Camera"],
  ["software", "Software"],
  ["value", "Price and value"],
];

function winnerLabel(winner, phones) {
  if (winner === "tie") return "Tie";
  const phone = winner === "phoneA" ? phones[0] : phones[1];
  return phone ? `${phone.brand} ${phone.model}` : winner;
}

export default function ComparePage() {
  const [phones, setPhones] = useState([]);
  const [firstId, setFirstId] = useState("");
  const [secondId, setSecondId] = useState("");
  const [comparison, setComparison] = useState(null);
  const [wasCached, setWasCached] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isComparing, setIsComparing] = useState(false);

  useEffect(() => {
    getPhones(1, 100)
      .then((response) => setPhones(response.data))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setIsLoading(false));
  }, []);

  const selectedPhones = [firstId, secondId]
    .map((id) => phones.find((phone) => phone._id === id))
    .filter(Boolean);

  async function handleCompare(event) {
    event.preventDefault();
    if (!firstId || !secondId || firstId === secondId || isComparing) return;

    setIsComparing(true);
    setError("");
    try {
      const response = await comparePhones(firstId, secondId);
      setComparison(response.data);
      setWasCached(Boolean(response.meta?.cached));
    } catch (requestError) {
      setComparison(null);
      setWasCached(false);
      setError(requestError.message);
    } finally {
      setIsComparing(false);
    }
  }

  return (
    <div>
      <div className="border-b border-neutral-200 pb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
          AI-assisted analysis
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Compare phones
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-600">
          Compare the records in your catalog using only the available
          specifications and prices.
        </p>
      </div>

      <form
        className="mt-8 grid gap-4 border border-neutral-200 p-5 md:grid-cols-[1fr_1fr_auto] md:items-end"
        onSubmit={handleCompare}
      >
        <label className="text-sm font-medium">
          First phone
          <select
            className="field mt-2"
            value={firstId}
            onChange={(event) => {
              setFirstId(event.target.value);
              setComparison(null);
              setWasCached(false);
            }}
          >
            <option value="">Select a phone</option>
            {phones.map((phone) => (
              <option key={phone._id} value={phone._id}>
                {phone.brand} {phone.model}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium">
          Second phone
          <select
            className="field mt-2"
            value={secondId}
            onChange={(event) => {
              setSecondId(event.target.value);
              setComparison(null);
              setWasCached(false);
            }}
          >
            <option value="">Select a phone</option>
            {phones
              .filter((phone) => phone._id !== firstId)
              .map((phone) => (
                <option key={phone._id} value={phone._id}>
                  {phone.brand} {phone.model}
                </option>
              ))}
          </select>
        </label>
        <button
          className="button-primary"
          type="submit"
          disabled={!firstId || !secondId || isComparing}
        >
          {isComparing ? "Comparing..." : "Compare"}
        </button>
      </form>

      <div className="mt-8">
        {isLoading ? (
          <LoadingState label="Loading phone options..." />
        ) : error ? (
          <ErrorState message={error} />
        ) : phones.length < 2 ? (
          <EmptyState message="Add at least two phones to compare them." />
        ) : !comparison ? (
          <p className="text-sm text-neutral-500">
            Select two different phones to generate a comparison.
          </p>
        ) : (
          <div className="space-y-10">
            <div className="grid gap-5 md:grid-cols-2">
              {selectedPhones.map((phone) => (
                <div key={phone._id} className="border border-neutral-200">
                  <div className="aspect-[4/3] overflow-hidden">
                    <PhoneImage
                      imageKey={phone.imageKey}
                      alt={`${phone.brand} ${phone.model}`}
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">
                      {phone.brand}
                    </p>
                    <h2 className="mt-1 text-lg font-semibold">
                      {phone.model}
                    </h2>
                    <p className="mt-3 text-sm text-neutral-600">
                      ${Number(phone.price).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <section>
              <h2 className="mb-4 text-xl font-semibold">Specifications</h2>
              <SpecificationsTable specifications={selectedPhones} comparison />
            </section>

            <section>
              <h2 className="mb-4 text-xl font-semibold">AI comparison</h2>
              <p className="mb-3 text-xs uppercase tracking-[0.14em] text-neutral-500">
                {wasCached ? "Cached comparison" : "Fresh comparison"}
              </p>
              <p className="border border-neutral-200 p-4 text-sm leading-6">
                {comparison.summary}
              </p>
              <div className="mt-4 overflow-x-auto border border-neutral-200">
                <table className="w-full min-w-[680px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50">
                      <th className="px-4 py-3 font-medium">Category</th>
                      <th className="px-4 py-3 font-medium">Analysis</th>
                      <th className="px-4 py-3 font-medium">Winner</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map(([key, label]) => (
                      <tr
                        key={key}
                        className="border-b border-neutral-200 last:border-b-0 align-top"
                      >
                        <th className="px-4 py-4 font-medium">{label}</th>
                        <td className="px-4 py-4 leading-6">
                          {comparison[key].analysis}
                        </td>
                        <td className="px-4 py-4 font-medium">
                          {winnerLabel(comparison[key].winner, selectedPhones)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
              {Object.entries(comparison.recommendations).map(
                ([key, value]) => (
                  <div key={key} className="border border-neutral-200 p-4">
                    <h3 className="font-medium capitalize">
                      {key === "everydayUse" ? "Everyday use" : key}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-neutral-600">
                      {value}
                    </p>
                  </div>
                ),
              )}
            </section>

            <section className="border-l-2 border-black pl-4">
              <h2 className="text-xl font-semibold">Final recommendation</h2>
              <p className="mt-2 text-sm leading-6">
                {comparison.finalRecommendation}
              </p>
            </section>

            {comparison.missingDataNotes.length > 0 && (
              <section>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-neutral-500">
                  Missing data and uncertainty
                </h2>
                <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-neutral-600">
                  {comparison.missingDataNotes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
