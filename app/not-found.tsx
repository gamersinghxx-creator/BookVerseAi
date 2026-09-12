import { Button } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="grid min-h-[80vh] place-items-center px-5 text-center">
      <div>
        <p className="display ink-gradient text-[7rem] font-black leading-none">404</p>
        <h1 className="display mt-4 text-h2 font-bold text-ink">
          This book hasn&apos;t been painted yet
        </h1>
        <p className="mx-auto mt-3 max-w-prose text-lead text-ink-soft">
          Head back and summon it from the search — any title will bloom into a
          full guide.
        </p>
        <Button href="/#library" className="mt-8">
          Back to the library
        </Button>
      </div>
    </div>
  );
}
