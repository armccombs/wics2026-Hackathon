"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../components/ui/button";
import { Copy, Check, ChevronDown, ChevronUp, Trash2 } from "lucide-react";

interface Organization {
  o_organizationkey: string;
  o_name: string;
  user_role: string;
}

interface GeneratedInvite {
  orgId: string;
  code: string;
  maxUses: number | null;
}

interface ShowingModal {
  orgId: string;
  maxUses: number;
}

interface Invitation {
  id: string;
  invite_code: string;
  max_uses: number | null;
  times_used: number;
  is_active: boolean;
  created_at: string;
  expires_at: string | null;
}

export default function ViewOrganizationPage() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [generatedInvites, setGeneratedInvites] = useState<Map<string, GeneratedInvite>>(new Map());
  const [generatingCode, setGeneratingCode] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showingModal, setShowingModal] = useState<ShowingModal | null>(null);
  const [expandedOrgId, setExpandedOrgId] = useState<string | null>(null);
  const [invites, setInvites] = useState<Map<string, Invitation[]>>(new Map());
  const [loadingInvites, setLoadingInvites] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await fetch("/api/org/list");
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Failed to fetch organizations");
          setLoading(false);
          return;
        }

        setOrganizations(data.organizations || []);
        setError("");
      } catch (err) {
        setError("An error occurred while fetching organizations");
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, []);

  const handleGenerateInviteCode = async (orgId: string, maxUses: number) => {
    setGeneratingCode(orgId);
    try {
      const response = await fetch("/api/org/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organization_id: orgId,
          max_uses: maxUses,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to generate invite code");
        setGeneratingCode(null);
        return;
      }

      const newInvites = new Map(generatedInvites);
      newInvites.set(orgId, {
        orgId,
        code: data.invitation.invite_code,
        maxUses,
      });
      setGeneratedInvites(newInvites);
      setShowingModal(null);
      setError("");
    } catch (err) {
      setError("An error occurred while generating the invite code");
    } finally {
      setGeneratingCode(null);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleFetchInvites = async (orgId: string) => {
    if (invites.has(orgId)) {
      // Already fetched, just toggle expansion
      setExpandedOrgId(expandedOrgId === orgId ? null : orgId);
      return;
    }

    setLoadingInvites(orgId);
    try {
      const response = await fetch(`/api/org/${orgId}/invites`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to fetch invites");
        setLoadingInvites(null);
        return;
      }

      const newInvites = new Map(invites);
      newInvites.set(orgId, data.invitations || []);
      setInvites(newInvites);
      setExpandedOrgId(orgId);
      setError("");
    } catch (err) {
      setError("An error occurred while fetching invites");
    } finally {
      setLoadingInvites(null);
    }
  };

  const handleDeleteInvite = async (inviteId: string, orgId: string) => {
    try {
      const response = await fetch(`/api/org/invites/${inviteId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to delete invite");
        return;
      }

      // Update the invites list by removing the deleted invite
      const newInvites = new Map(invites);
      const orgInvites = newInvites.get(orgId) || [];
      newInvites.set(
        orgId,
        orgInvites.map((inv) =>
          inv.id === inviteId ? { ...inv, is_active: false } : inv
        )
      );
      setInvites(newInvites);
      setError("");
    } catch (err) {
      setError("An error occurred while deleting the invite");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-100 p-6">
        <div className="w-full max-w-2xl rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-center text-zinc-600">Loading organizations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 p-6">
      <div className="w-full max-w-2xl rounded-xl border bg-white p-6 shadow-sm">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-lg font-semibold text-zinc-900">
            Your Organizations
          </h1>
          <p className="text-sm text-zinc-500">
            Generate and manage invite codes for your organizations
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Organizations List */}
        <div className="flex flex-col gap-4">
          {organizations.length === 0 ? (
            <p className="text-center text-sm text-zinc-500 py-6">
              You are not part of any organizations yet
            </p>
          ) : (
            organizations.map((org) => {
              const generatedInvite = generatedInvites.get(org.o_organizationkey);
              return (
                <div
                  key={org.o_organizationkey}
                  className="rounded-lg border border-zinc-200 bg-zinc-50 p-4"
                >
                  <div className="mb-3">
                    <h3 className="font-semibold text-zinc-900">{org.o_name}</h3>
                    <p className="text-xs text-zinc-500">Role: {org.user_role}</p>
                  </div>

                  {generatedInvite ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-3 py-2">
                        <span className="flex-1 text-sm font-mono text-zinc-900">
                          {generatedInvite.code}
                        </span>
                        <button
                          onClick={() => handleCopyCode(generatedInvite.code)}
                          className="rounded-md p-1.5 hover:bg-zinc-100 transition"
                          title="Copy code"
                        >
                          {copiedCode === generatedInvite.code ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4 text-zinc-600" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-zinc-500">
                        {generatedInvite.maxUses === null || generatedInvite.maxUses === undefined
                          ? "⚠️ This code has unlimited uses"
                          : generatedInvite.maxUses === 1
                          ? "⚠️ This code can be used only once"
                          : `⚠️ This code can be used up to ${generatedInvite.maxUses} times`}
                      </p>
                    </div>
                  ) : org.user_role === "Admin" ? (
                    <Button
                      onClick={() => setShowingModal({ orgId: org.o_organizationkey, maxUses: 1 })}
                      disabled={generatingCode === org.o_organizationkey}
                      className="w-full"
                      size="sm"
                    >
                      {generatingCode === org.o_organizationkey
                        ? "Generating..."
                        : "Generate Invite Code"}
                    </Button>
                  ) : null}

                  {/* View Invites Button */}
                  {org.user_role === "Admin" && (
                    <Button
                      onClick={() => handleFetchInvites(org.o_organizationkey)}
                      variant="outline"
                      className="w-full mt-3"
                      size="sm"
                      disabled={loadingInvites === org.o_organizationkey}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>
                          {loadingInvites === org.o_organizationkey
                            ? "Loading..."
                            : "View Invites"}
                        </span>
                        {expandedOrgId === org.o_organizationkey ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </Button>
                  )}

                  {/* Invites List */}
                  {expandedOrgId === org.o_organizationkey && invites.has(org.o_organizationkey) && (
                    <div className="mt-4 border-t pt-4 space-y-2">
                      {invites.get(org.o_organizationkey)?.length === 0 ? (
                        <p className="text-sm text-zinc-500 text-center py-2">
                          No invites created yet
                        </p>
                      ) : (
                        invites.get(org.o_organizationkey)?.map((invite) => {
                          const isExpired =
                            invite.expires_at &&
                            new Date(invite.expires_at) < new Date();
                          const isMaxedOut =
                            invite.max_uses !== null &&
                            invite.times_used >= invite.max_uses;
                          const statusColor =
                            !invite.is_active || isExpired
                              ? "text-red-600"
                              : isMaxedOut
                              ? "text-amber-600"
                              : "text-green-600";

                          return (
                            <div
                              key={invite.id}
                              className="rounded-md border border-zinc-200 bg-white p-3 text-sm"
                            >
                              <div className="flex items-center justify-between gap-2 mb-2">
                                <code className="font-mono text-zinc-900 flex-1 truncate">
                                  {invite.invite_code}
                                </code>
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs font-medium ${statusColor}`}>
                                    {!invite.is_active
                                      ? "Disabled"
                                      : isExpired
                                      ? "Expired"
                                      : isMaxedOut
                                      ? "Max Uses"
                                      : "Active"}
                                  </span>
                                  <button
                                    onClick={() =>
                                      handleDeleteInvite(invite.id, org.o_organizationkey)
                                    }
                                    className="rounded-md p-1 hover:bg-red-50 transition"
                                    title="Delete invite"
                                  >
                                    <Trash2 className="h-4 w-4 text-zinc-400 hover:text-red-600" />
                                  </button>
                                </div>
                              </div>

                              <div className="text-xs text-zinc-500 space-y-1">
                                <p>
                                  Uses: {invite.times_used}
                                  {invite.max_uses !== null
                                    ? ` / ${invite.max_uses}`
                                    : " / ∞"}
                                </p>
                                {invite.expires_at && (
                                  <p>
                                    Expires:{" "}
                                    {new Date(invite.expires_at).toLocaleDateString()}
                                  </p>
                                )}
                                <p>
                                  Created:{" "}
                                  {new Date(invite.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Back Button */}
        <div className="mt-6">
          <Button
            variant="outline"
            onClick={() => router.push("/org")}
            className="w-full"
          >
            Back
          </Button>
        </div>

        {/* Max Uses Modal */}
        {showingModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg">
              <h2 className="text-lg font-semibold text-zinc-900 mb-4">
                How many times can this code be used?
              </h2>

              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-zinc-700">
                    Maximum uses
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={showingModal.maxUses}
                    onChange={(e) =>
                      setShowingModal({
                        ...showingModal,
                        maxUses: Math.max(1, parseInt(e.target.value) || 1),
                      })
                    }
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleGenerateInviteCode(
                          showingModal.orgId,
                          showingModal.maxUses
                        );
                      }
                    }}
                    className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
                    autoFocus
                  />
                  <p className="text-xs text-zinc-500">
                    Set to 1 for single-use codes, or higher for multiple uses
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() =>
                      handleGenerateInviteCode(
                        showingModal.orgId,
                        showingModal.maxUses
                      )
                    }
                    disabled={generatingCode === showingModal.orgId}
                    className="flex-1"
                  >
                    {generatingCode === showingModal.orgId
                      ? "Generating..."
                      : "Generate"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowingModal(null)}
                    disabled={generatingCode === showingModal.orgId}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}