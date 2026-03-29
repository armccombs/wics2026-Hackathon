"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/contexts/auth";
import type { UserProfile } from "@/lib/roles";

export default function AccountInfo() {
  const { profile, isLoading } = useAuth();
  const router = useRouter();
  const [popupType, setPopupType] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        pf_username: profile.pf_username || "",
        pf_first_name: profile.pf_first_name || "",
        pf_last_name: profile.pf_last_name || "",
        pf_email: profile.pf_email || "",
        pf_phone: profile.pf_phone || "",
      });
    }
  }, [profile]);

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (field: string) => {
    setSubmitLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const data = await response.json();
      setMessage({
        type: "success",
        text: `${field} updated successfully!`,
      });
      setPopupType(null);

      // Update form data with the response
      if (data.profile) {
        setFormData(data.profile);
      }

      // Refresh the page after a short delay
      setTimeout(() => {
        setMessage(null);
        window.location.reload();
      }, 1500);
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to update profile. Please try again.",
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-screen bg-white">
      {popupType && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
          onClick={() => setPopupType(null)}
        >
          <div
            className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4">Confirm change?</h2>

            <p className="mb-6 text-zinc-600">
              Are you sure you want to change your {popupType}?
            </p>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setPopupType(null)}
                className="px-4 py-2 border rounded-lg"
                disabled={submitLoading}
              >
                Cancel
              </button>
              <button
                onClick={() => handleSubmit(popupType)}
                disabled={submitLoading}
                className="px-4 py-2 border rounded-lg bg-black text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {submitLoading ? "Updating..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {message && (
        <div
          className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-40 ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <p>Loading profile...</p>
        </div>
      ) : (
        <>
          <h1 className="absolute top-30 left-19 text-3xl font-semibold">
            Account Details
          </h1>

          <div className="absolute top-50 left-20 w-full max-w-3xl">
            <p className="mb-4 text-lg">Username: {formData.pf_username}</p>

            <div className="flex gap-4">
              <input
                type="text"
                placeholder="New Username"
                value={formData.pf_username || ""}
                onChange={(e) =>
                  handleInputChange("pf_username", e.target.value)
                }
                className="w-full max-w-md px-1 py-2 border rounded-lg"
              />

              <button
                onClick={() => setPopupType("username")}
                disabled={submitLoading}
                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
              >
                Update Username
              </button>
            </div>
          </div>

          <div className="absolute top-83 left-20 w-full max-w-3xl">
            <p className="mb-4 text-lg">
              Name: {formData.pf_first_name} {formData.pf_last_name}
            </p>

            <div className="flex gap-4">
              <input
                type="text"
                placeholder="New First Name"
                value={formData.pf_first_name || ""}
                onChange={(e) =>
                  handleInputChange("pf_first_name", e.target.value)
                }
                className="w-full max-w-xs px-1 py-2 border rounded-lg"
              />
              <input
                type="text"
                placeholder="New Last Name"
                value={formData.pf_last_name || ""}
                onChange={(e) =>
                  handleInputChange("pf_last_name", e.target.value)
                }
                className="w-full max-w-xs px-1 py-2 border rounded-lg"
              />

              <button
                onClick={() => setPopupType("name")}
                disabled={submitLoading}
                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
              >
                Update Name
              </button>
            </div>
          </div>

          <div className="absolute top-115 left-20 w-full max-w-3xl">
            <p className="mb-4 text-lg">Email: {formData.pf_email}</p>

            <div className="flex gap-4">
              <input
                type="text"
                placeholder="New Email Address"
                value={formData.pf_email || ""}
                onChange={(e) => handleInputChange("pf_email", e.target.value)}
                className="w-full max-w-md px-1 py-2 border rounded-lg"
              />

              <button
                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
                onClick={() => setPopupType("email")}
                disabled={submitLoading}
              >
                Update Email Address
              </button>
            </div>
          </div>

          <div className="absolute top-139 left-20 w-full max-w-3xl">
            <p className="mb-4 text-lg">Phone Number: {formData.pf_phone}</p>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="New Phone Number"
                value={formData.pf_phone || ""}
                onChange={(e) => handleInputChange("pf_phone", e.target.value)}
                className="w-full max-w-sm px-1 py-2 border rounded-lg"
              />

              <button
                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
                onClick={() => setPopupType("phone number")}
                disabled={submitLoading}
              >
                Update Phone Number
              </button>
            </div>
          </div>

          <button
            onClick={() => router.push("/dashboard")}
            className="absolute bottom-10 right-10 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            Return to Dashboard
          </button>

          <button
            onClick={() => router.push("/auth/login")}
            className="absolute bottom-10 right-60 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            Sign Out
          </button>
        </>
      )}
    </div>
  );
}
