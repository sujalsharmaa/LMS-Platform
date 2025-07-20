"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GithubIcon } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react"; // Import useEffect

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Use useEffect to handle redirection as a side effect
  useEffect(() => {
    if (status === "authenticated" && session) {
      router.replace("/");
    }
  }, [session, status, router]); // Dependencies: run this effect when session, status, or router changes

  // Handle loading state
  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        {/* You can add a spinner or loading text here */}
        Loading...
      </div>
    );
  }

  // If status is authenticated, the useEffect will handle the redirect.
  // We can return null or a simple message to prevent the login page from flashing
  // before the redirect occurs.
  if (status === "authenticated") {
    return null; // Or a "Redirecting..." message
  }

  // Render the login form only if not authenticated and not loading
  return (
    <Card className="max-w-md mx-auto mt-20">
      <CardHeader>
        <CardTitle className="text-xl">Welcome back!!!</CardTitle>
        <CardDescription>Login with your GitHub or Google account</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Button className="w-full" variant="outline" onClick={() => signIn("github")}>
          <GithubIcon className="size-4 mr-2" />
          Sign in with GitHub
        </Button>

        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
          <span className="relative z-10 bg-card px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
        <div className="grid gap-3">
        <Button onClick={() => signIn("google")} className="hover:bg-gray-100 flex items-center gap-2">
          <FcGoogle className="size-5" />
          Continue with Google
        </Button>
        </div>
      </CardContent>
    </Card>
  );
}