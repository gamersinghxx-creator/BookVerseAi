import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-[80vh] place-items-center px-5 text-center">
      <div>
        <p className="display text-[7rem] font-black leading-none ink-gradient">404</p>
        <h1 className="display mt-4 text-3xl font-bold text-ink">
          This book hasn&apos;t been painted yet
        </h1>
        <p className="mx-auto mt-3 max-w-md text-ink-soft">
          Head back and summon it from the search - any title will bloom into a
          full guide.
        </p>
        <Link href="/#library" className="btn-primary mt-8">
          Back to the library
        </Link>
      </div>
    </div>
  );
}
