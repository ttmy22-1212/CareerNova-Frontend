import { redirect } from "next/navigation";

export default async function ResetPasswordRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  redirect(`/auth/reset-password${token ? `?token=${token}` : ""}`);
}
