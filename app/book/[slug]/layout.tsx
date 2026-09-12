import { notFound } from "next/navigation";
import { loadBook } from "./_data";

// The book-existence check lives in the layout (above the loading.tsx Suspense
// boundary) so an unknown slug yields a real HTTP 404 rather than a streamed
// 200. See: github.com/vercel/next.js/issues/76474.
export default async function BookLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!(await loadBook(slug))) notFound();
  return <>{children}</>;
}
