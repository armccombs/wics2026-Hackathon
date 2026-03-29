"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

export default function JoinOrganizationPage() {
  const router = useRouter();
  const [code, setCode] = useState("");

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 p-6">
      <div className="w-full max-w-md rounded-xl border bg-white p-6 shadow-sm">
        {/* Header */}
        <div className="mb-5">
          <h1 className="text-lg font-semibold text-zinc-900">
            Join Organization
          </h1>
          <p className="text-sm text-zinc-500">
            Enter your invitation code below
          </p>
        </div>

        {/* Input - UPDATE WHEN LINKED TO BACKEND, RN TAKES INPUT & DOES NOTHING WITH IT*/}
        <div className="flex flex-col gap-3">
          <Input
            placeholder="Enter invite code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />

          <Button
            onClick={() => {
              console.log("Invite code inputted");
            }}
          >
            Join
          </Button>

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