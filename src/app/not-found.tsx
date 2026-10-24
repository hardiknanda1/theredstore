import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[80svh] flex-col items-center justify-center bg-oxblood px-4 pt-20 text-center text-bone">
      <p className="eyebrow text-scarlet">404</p>
      <h1 className="display mt-5 text-6xl md:text-8xl">Not in red.</h1>
      <p className="mt-6 max-w-sm text-sm text-bone/60">The page you were looking for doesn&rsquo;t exist, or has moved.</p>
      <div className="mt-10 flex gap-3">
        <Link href="/shop" className="eyebrow bg-bone px-6 py-4 text-charcoal">
          Shop the collection
        </Link>
        <Link href="/" className="eyebrow border border-bone/30 px-6 py-4">
          Home
        </Link>
      </div>
    </div>
  );
}
