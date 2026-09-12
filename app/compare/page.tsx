import { listAllBooks } from "@/lib/store";
import { CompareClient } from "@/components/compare/CompareClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Compare two books — BookVerse AI",
  description: "Weigh two books side by side: their promise, core ideas, and how they read.",
};

export default async function ComparePage() {
  const books = await listAllBooks();
  return <CompareClient books={books} />;
}
