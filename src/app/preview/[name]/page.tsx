import { notFound } from "next/navigation";
import { registry } from "../registry";

export default async function PreviewPage({ params }: { params: Promise<{ name: string }> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const { name } = await params;
  const Component = Object.hasOwn(registry, name) ? registry[name] : undefined;
  if (!Component) notFound();
  return <Component />;
}
