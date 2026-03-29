"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

export default function ViewOrganizationPage() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState("");
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 p-6">
      <div className="w-full max-w-md rounded-xl border bg-white p-6 shadow-sm">
        {/* Header */}
        <div className="mb-5">
          <h1 className="text-lg font-semibold text-zinc-900">
            View Organization(s)
          </h1>
          <p className="text-sm text-zinc-500">
            meow meow meow meow
          </p>
        </div>

        {/* Invite Code, update button when BACKEND */}
        <div className="flex flex-col gap-3">

          <Button
            onClick={() => {
              const code = "wowie"; //temp hard coded invite code UPDATE WHEN LINKING TO BACKEND
              setInviteCode(code);
            }}
          >
            Generate invite code
          </Button>

          {inviteCode && (
            <div className="rounded-md border bg-zinc-50 px-3 py-2 text-sm text-zinc-700"> 
              Invite Code: <span className="font-semibold">{inviteCode}</span> </div>
          )} 
          <Button 
            variant="outline"
            onClick={() => router.push("/org")}
          >
            Back
          </Button>
        </div>
      </div>
    </div>
  );
}