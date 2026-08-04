import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

/** Legacy `/category/[id]` links redirect to menu with category filter applied. */
export default async function CategoryDetailRedirectPage({ params }: Props) {
  const { id } = await params;
  redirect(`/menu?category=${encodeURIComponent(id)}`);
}
