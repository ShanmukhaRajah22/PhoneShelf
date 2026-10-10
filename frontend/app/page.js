"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getPhones } from "../lib/api";
import PhoneCard from "../components/PhoneCard";
import Pagination from "../components/Pagination";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../components/StatusMessage";

const PAGE_SIZE = 12;

export default function CatalogPage() {
  const [phones, setPhones] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadPhones(nextPage = page) {
    setIsLoading(true);
    setError("");
    try {
      const response = await getPhones(nextPage, PAGE_SIZE);
      setPhones(response.data);
      setPagination(response.pagination);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadPhones(page);
  }, [page]);

  const filteredPhones = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return phones;
    return phones.filter((phone) =>
      `${phone.brand} ${phone.model}`.toLowerCase().includes(term),
    );
  }, [phones, search]);

  return (
    <div>
      <div className="flex flex-col justify-between gap-6 border-b border-neutral-200 pb-8 md:flex-row md:items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
            The catalog
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Phones, clearly.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-600">
            A focused shelf for comparing the phones that matter to you.
          </p>
        </div>
        <Link className="button-primary" href="/phones/new">
          Add phone
        </Link>
      </div>

      <div className="my-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="sr-only" htmlFor="search">
          Search phones
        </label>
        <input
          id="search"
          className="field max-w-md"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by brand or model"
        />
        {!isLoading && (
          <p className="text-sm text-neutral-500">
            {pagination.total} {pagination.total === 1 ? "phone" : "phones"}
          </p>
        )}
      </div>

      {isLoading ? (
        <LoadingState label="Loading catalog..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadPhones(page)} />
      ) : filteredPhones.length === 0 ? (
        <EmptyState
          message={
            search
              ? "No phones match your search."
              : "Your catalog is empty. Add the first phone."
          }
        />
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredPhones.map((phone) => (
              <PhoneCard key={phone._id} phone={phone} />
            ))}
          </div>
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onChange={setPage}
          />
        </>
      )}
    </div>
  );
}
