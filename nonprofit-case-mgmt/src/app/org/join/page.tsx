"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { AlertCircle, CheckCircle } from "lucide-react";

export default function JoinOrganizationPage() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleJoinOrganization = async () => {
    if (!inviteCode.trim()) {
      setError("Please enter an invite code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/org/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invite_code: inviteCode.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to join organization");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/org");
      }, 2000);
    } catch (err) {
      setError("An error occurred while joining the organization");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-100 p-6">
        <div className="w-full max-w-md rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center gap-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
            <div className="text-center">
              <h1 className="text-lg font-semibold text-zinc-900">
                Successfully joined!
              </h1>
              <p className="mt-1 text-sm text-zinc-500">
                Redirecting you to organizations page...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 p-6">
      <div className="w-full max-w-md rounded-xl border bg-white p-6 shadow-sm">
        {/* Header */}
        <div className="mb-5">
          <h1 className="text-lg font-semibold text-zinc-900">
            Join Organization
          </h1>
          <p className="text-sm text-zinc-500">
            Enter your invitation code to join an organization
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-md bg-red-50 px-3 py-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Input and Button */}
        <div className="flex flex-col gap-3">
          <Input
            placeholder="Enter invite code"
            value={inviteCode}
            onChange={(e) => {
              setInviteCode(e.target.value);
              setError("");
            }}
            onKeyPress={(e) => e.key === "Enter" && handleJoinOrganization()}
            disabled={loading}
          />

          <Button
            onClick={handleJoinOrganization}
            disabled={loading || !inviteCode.trim()}
          >
            {loading ? "Joining..." : "Join"}
          </Button>

          <Button variant="outline" onClick={() => router.push("/org")} disabled={loading}>
            Back
          </Button>
        </div>
      </div>
    </div>
  );
}