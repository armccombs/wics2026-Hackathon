"use client";

import { useState } from "react";
import { Loader2, Upload, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "./ui/button";

interface ImportClientsModalProps {
  onClose: () => void;
  onImportSuccess: (clients: any[]) => void;
  organizationId: string;
}

export function ImportClientsModal({
  onClose,
  onImportSuccess,
  organizationId,
}: ImportClientsModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [csvContent, setCsvContent] = useState("");
  const [fileName, setFileName] = useState("");
  const [success, setSuccess] = useState(false);
  const [successCount, setSuccessCount] = useState(0);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError(null);
    setValidationErrors([]);

    try {
      const content = await file.text();
      setCsvContent(content);
    } catch (err) {
      setError("Failed to read file");
      console.error(err);
    }
  };

  const handleImport = async () => {
    if (!csvContent.trim()) {
      setError("Please select a CSV file");
      return;
    }

    setLoading(true);
    setError(null);
    setValidationErrors([]);

    try {
      const response = await fetch("/api/clients/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          csvContent,
          orgId: organizationId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.details && Array.isArray(data.details)) {
          setValidationErrors(data.details);
          setError("CSV validation failed. Please fix the errors below.");
        } else {
          setError(data.error || "Failed to import clients");
        }
        return;
      }

      setSuccess(true);
      setSuccessCount(data.clientsImported || 0);
      onImportSuccess(data.clients || []);

      // Auto-close after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError("An error occurred during import");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const template =
      "fullName,dob,email,phone,language,householdSize,gender,configurable1,configurable2,configurable3\n" +
      "John Doe,1990-05-15,john@example.com,555-1234,English,4,Male,,,,\n" +
      "Jane Smith,1992-08-22,jane@example.com,555-5678,Spanish,3,Female,,,,";

    const blob = new Blob([template], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", "clients_template.csv");
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-xl rounded-xl border border-zinc-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">Import Clients</h2>
            <p className="text-sm text-zinc-400">
              Upload a CSV file to add multiple clients at once
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-md px-2 py-1 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-4 px-6 py-5">
          {success ? (
            <div className="rounded-md bg-emerald-50 p-4 border border-emerald-200 flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-emerald-900">Import successful!</p>
                <p className="text-sm text-emerald-800">
                  {successCount} client(s) have been imported.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Error Messages */}
              {error && (
                <div className="rounded-md bg-red-50 p-4 border border-red-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-red-900">{error}</p>
                      {validationErrors.length > 0 && (
                        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-red-800">
                          {validationErrors.map((err, i) => (
                            <li key={i}>{err}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* File Upload Area */}
              <div>
                <label className="text-xs font-medium text-zinc-600 block mb-2">
                  CSV File *
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    disabled={loading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <div className="border-2 border-dashed border-zinc-300 rounded-md p-6 text-center hover:border-zinc-400 transition disabled:opacity-50">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-zinc-400" />
                    <p className="text-sm font-medium text-zinc-700">
                      {fileName || "Click to select or drag and drop"}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      CSV files only (.csv)
                    </p>
                  </div>
                </div>
              </div>

              {/* CSV Content Preview */}
              {csvContent && (
                <div>
                  <label className="text-xs font-medium text-zinc-600 block mb-2">
                    Preview
                  </label>
                  <div className="bg-zinc-50 rounded-md p-3 border border-zinc-200 text-xs font-mono overflow-x-auto">
                    {csvContent.split("\n").slice(0, 3).map((line, i) => (
                      <div key={i} className="text-zinc-600 truncate">
                        {line}
                      </div>
                    ))}
                    {csvContent.split("\n").length > 3 && (
                      <div className="text-zinc-400 mt-1">
                        ... and {csvContent.split("\n").length - 3} more rows
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Helper Text */}
              <div className="bg-blue-50 rounded-md p-3 border border-blue-200">
                <p className="text-xs text-blue-900">
                  <span className="font-medium">Required columns:</span> fullName
                </p>
                <p className="text-xs text-blue-800 mt-1">
                  <span className="font-medium">Optional columns:</span> dob, email, phone, language, householdSize, gender, configurable1, configurable2, configurable3
                </p>
                <button
                  onClick={downloadTemplate}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-2 underline"
                >
                  Download template
                </button>
              </div>
            </>
          )}
        </div>

        {!success && (
          <div className="flex justify-end gap-2 border-t border-zinc-100 px-6 py-4">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={loading || !csvContent.trim()}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Importing..." : "Import Clients"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
