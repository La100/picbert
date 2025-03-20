import { AuthForm } from "@/components/authentication/AuthForm";
import { Metadata } from "next";
import Logo from "@/components/Logo";

type AuthMode = "login" | "signup" | "reset";

interface SearchParams {
  state?: AuthMode;
}

export const metadata: Metadata = {
  title: "Authentication",
  description: "Authentication forms built using the components.",
};

export default async function AuthenticationPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { state } = await searchParams;
  return (
    <>
      <div className="relative h-full min-h-screen w-full flex flex-col items-center justify-center px-4">
        <div className="absolute top-6 left-6">
          <Logo />
        </div>
        
        <div className="w-full max-w-sm mx-auto">
          <AuthForm state={state ?? "login"} />
        </div>
      </div>
    </>
  );
}
