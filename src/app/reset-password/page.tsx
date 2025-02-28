import { ChangePasswordForm } from "@/components/account/ChangePasswordForm";
import Logo from "@/components/Logo";
import { Metadata } from "next";
import AuthBg from "@/public/Abstract Curves and Colors.jpeg";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Reset Password | Pictoria AI",
  description: "Reset password form built using the components.",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  return (
    <>
      <div className=" relative h-full md:h-screen flex-col items-center justify-center grid grid-cols-1  md:grid-cols-2 md:px-0">
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r md:flex">
          <div className="w-full h-[30%] bg-gradient-to-t from-transparent to-black/50 absolute top-0 left-0 z-10" />
          <div className="w-full h-[40%] bg-gradient-to-b from-transparent to-black/50 absolute bottom-0 left-0 z-10" />
          <div className="absolute inset-0">
            <Image
              src={AuthBg.src}
              alt="auth-bg"
              fill
              className="object-cover"
              priority
              sizes="50vw"
            />
          </div>
          <div className="relative z-20 flex items-center text-lg font-medium">
            <Logo />
          </div>
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">
                &ldquo;Pictoria AI is a game changer for me. I have been able to
                generate high quality professional headshots within minutes. It
                has saved me countless hours of work and cost as well.&rdquo;
              </p>
              <footer className="text-sm">David S.</footer>
            </blockquote>
          </div>
        </div>
        <div className="relative p-8 sm:p-12 md:p-8 h-full flex flex-col justify-start md:justify-center items-center ">
          <div className="relative md:absolute top-none md:top-8 px-0 md:px-8 w-full flex items-center justify-start ">
            <div className="relative z-20 items-center text-lg font-medium flex md:hidden">
              <Logo />
            </div>
          </div>
          <div className="mt-12 md:mt-0  mx-auto flex w-full flex-col justify-center space-y-6 max-w-xl sm:w-[350px]">
            <ChangePasswordForm />
          </div>
        </div>
      </div>
    </>
  );
}
