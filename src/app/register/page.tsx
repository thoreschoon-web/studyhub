import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { googleEnabled } from "@/auth.config";
import { AuthForm } from "@/components/auth/AuthForm";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) redirect("/");
  return (
    <div className="grid min-h-screen place-items-center px-5 py-10">
      <AuthForm mode="register" googleEnabled={googleEnabled} />
    </div>
  );
}
