import Link from "next/link";
import PhoneImage from "./PhoneImage";

export default function PhoneCard({ phone }) {
  return (
    <article className="flex flex-col border border-neutral-200 bg-white">
      <div className="aspect-[4/3] overflow-hidden">
        <PhoneImage
          imageKey={phone.imageKey}
          alt={`${phone.brand} ${phone.model}`}
        />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">
          {phone.brand}
        </p>
        <h2 className="mt-1 text-lg font-semibold">{phone.model}</h2>
        <p className="mt-4 text-sm text-neutral-600">
          ${Number(phone.price).toLocaleString()}
        </p>
        <Link
          className="button-secondary mt-5 w-full"
          href={`/phones/${phone._id}`}
        >
          View details
        </Link>
      </div>
    </article>
  );
}
