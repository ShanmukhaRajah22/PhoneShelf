import PhoneForm from "../../../components/PhoneForm";

export default function NewPhonePage() {
  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
        Catalog entry
      </p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight">Add a phone</h1>
      <p className="mt-3 mb-10 text-sm text-neutral-600">
        Record the details you want to keep on the shelf.
      </p>
      <PhoneForm />
    </div>
  );
}
