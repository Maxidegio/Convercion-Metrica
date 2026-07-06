import { redirect } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { LoginForm } from "@/features/auth/components/login-form";
import { auth } from "@/lib/auth";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/");

  return (
    <main className="grid min-h-screen place-items-center px-6 py-10">
      <div className="w-full max-w-md rounded-[26px] border border-border bg-card p-9 shadow-pop">
        <div className="flex justify-center">
          <Logo />
        </div>
        <p className="my-6 text-center text-xs font-bold uppercase tracking-[0.32em] text-muted">
          Control de Stock
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
