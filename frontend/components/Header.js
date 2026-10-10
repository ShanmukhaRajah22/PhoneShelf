import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-neutral-200">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <Link href="/" className="text-lg font-bold tracking-tight">
          PhoneShelf
        </Link>
        <nav className="flex items-center gap-5 text-sm text-neutral-600">
          <Link className="hover:text-black" href="/">
            Catalog
          </Link>
          <Link className="hover:text-black" href="/compare">
            Compare
          </Link>
          <Link className="hover:text-black" href="/phones/new">
            Add phone
          </Link>
        </nav>
      </div>
    </header>
  );
}
