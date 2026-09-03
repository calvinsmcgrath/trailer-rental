import { redirect } from "next/navigation";
import { assertAdminSlug, isAdminAuthed } from "@/lib/admin/guard";
import { LoginForm } from "./_components/LoginForm";

export default async function AdminLoginPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  assertAdminSlug(slug);

  if (await isAdminAuthed()) {
    redirect(`/admin/${slug}/bookings`);
  }

  return <LoginForm slug={slug} />;
}
