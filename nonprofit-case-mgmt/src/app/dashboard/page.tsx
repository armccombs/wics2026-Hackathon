"use client";

import { useState, useEffect } from "react";
import {
  Users,
  LayoutGrid,
  FileText,
  FolderOpen,
  Settings,
  Search,
  ChevronRight,
  Plus,
  Loader2,
  Upload,
  Download,
} from "lucide-react";

import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { ImportClientsModal } from "../components/ImportClientsModal";
import { useRouter } from "next/navigation";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../components/ui/table";

type ClientStatus = "Active" | "Inactive" | "Pending";

export interface Client {
  id: string;
  name: string;
  fullName: string;
  dob: string;
  email?: string;
  phone?: string;
  language?: string;
  householdSize?: number;
  gender?: string;

  // added so the profile popup can use these 
  program?: string;
  status?: ClientStatus;
  intakeDate?: string;
  address?: string;
  notes?: string;
}

// nav items

const NAV_ITEMS = [
  { label: "Clients", icon: Users, route: "/dashboard" },
  { label: "Reports", icon: FileText, route: "/reports" },
  { label: "Organizations", icon: FolderOpen, route: "/org" },
  { label: "Programs", icon: LayoutGrid, route: "#" },
  { label: "Settings", icon: Settings, route: "/Account" },
];

// client status styling & display
const STATUS_STYLES: Record<ClientStatus, string> = {
  Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Inactive: "bg-zinc-100 text-zinc-500 border-zinc-200",
};

function StatusBadge({ status }: { status: ClientStatus }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}

// new client pop up UI
function NewClientModal({
  onClose,
  onClientCreated,
  organizationId,
}: {
  onClose: () => void;
  onClientCreated: (client: Client) => void;
  organizationId: string;
}) {
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [language, setLanguage] = useState("");
  const [householdSize, setHouseholdSize] = useState("");
  const [gender, setGender] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!fullName) {
      setError("Full name is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          dob: dob || null,
          email: email || null,
          phone: phone || null,
          language: language || null,
          householdSize: householdSize ? parseInt(householdSize) : null,
          gender: gender || null,
          orgId: organizationId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create client");
        return;
      }

      onClientCreated(data.client);
      onClose();
    } catch (err) {
      setError("An error occurred while creating the client");
      console.error(err);
    } finally {
      setLoading(false);
    }
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
            <h2 className="text-base font-semibold text-zinc-900">New Client</h2>
            <p className="text-sm text-zinc-400">
              Add a new client to your organization
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-md px-2 py-1 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 px-6 py-5 md:grid-cols-2">
          <div className="md:col-span-2 flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-600">
              Full Name *
            </label>
            <input
              type="text"
              placeholder="Enter full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-400"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-600">Date of Birth</label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-400"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-600">Gender</label>
            <input
              type="text"
              placeholder="Enter gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-400"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-600">Email</label>
            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-400"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-600">Phone</label>
            <input
              type="tel"
              placeholder="Enter phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-400"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-600">Language</label>
            <input
              type="text"
              placeholder="Enter language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-400"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-600">Household Size</label>
            <input
              type="number"
              placeholder="Enter household size"
              value={householdSize}
              onChange={(e) => setHouseholdSize(e.target.value)}
              className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-400"
            />
          </div>

          {error && (
            <div className="md:col-span-2 rounded-md bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-zinc-100 px-6 py-4">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Creating..." : "Save Client"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// pop up for client profile
function ClientProfileModal({
  client,
  onClose,
  organizationId,
  onClientUpdated,
}: {
  client: Client;
  onClose: () => void;
  organizationId: string;
  onClientUpdated?: (updatedClient: Client) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Client>({
    ...client,
    program: client.program || "",
    status: client.status || "Active",
    intakeDate: client.intakeDate || "",
    address: client.address || "",
    notes: client.notes || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSaveChanges = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/clients", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: client.id,
          orgId: organizationId,
          fullName: formData.fullName,
          dob: formData.dob,
          email: formData.email,
          phone: formData.phone,
          language: formData.language,
          householdSize: formData.householdSize,
          gender: formData.gender,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to update client");
        return;
      }

      // Updated client in parent component
      if (onClientUpdated) {
        onClientUpdated({
          ...formData,
          id: client.id,
          name: formData.fullName,
        });
      }

      setIsEditing(false);
    } catch (err) {
      setError("An error occurred while updating the client");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg rounded-xl border bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            {isEditing ? (
              <input
                className="text-lg font-semibold border rounded px-2 py-1"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value, name: e.target.value })
                }
              />
            ) : (
              <h2 className="text-lg font-semibold">{formData.fullName}</h2>
            )}
            <p className="text-sm text-zinc-500">ID: {formData.id}</p>
          </div>

          <button
            onClick={onClose}
            className="rounded-md px-2 py-1 text-zinc-400 hover:bg-zinc-100"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-4 space-y-3 text-sm">
          <div>
            <strong>Email:</strong>{" "}
            {isEditing ? (
              <input
                type="email"
                className="border rounded px-2 py-1 ml-2"
                value={formData.email || ""}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            ) : (
              formData.email || "—"
            )}
          </div>

          <div>
            <strong>Phone:</strong>{" "}
            {isEditing ? (
              <input
                type="tel"
                className="border rounded px-2 py-1 ml-2"
                value={formData.phone || ""}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            ) : (
              formData.phone || "—"
            )}
          </div>

          <div>
            <strong>Date of Birth:</strong>{" "}
            {isEditing ? (
              <input
                type="date"
                className="border rounded px-2 py-1 ml-2"
                value={formData.dob || ""}
                onChange={(e) =>
                  setFormData({ ...formData, dob: e.target.value })
                }
              />
            ) : (
              formData.dob || "—"
            )}
          </div>

          <div>
            <strong>Language:</strong>{" "}
            {isEditing ? (
              <input
                className="border rounded px-2 py-1 ml-2"
                value={formData.language || ""}
                onChange={(e) =>
                  setFormData({ ...formData, language: e.target.value })
                }
              />
            ) : (
              formData.language || "—"
            )}
          </div>

          <div>
            <strong>Household Size:</strong>{" "}
            {isEditing ? (
              <input
                type="number"
                className="border rounded px-2 py-1 ml-2"
                value={formData.householdSize || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    householdSize: parseInt(e.target.value) || undefined,
                  })
                }
              />
            ) : (
              formData.householdSize || "—"
            )}
          </div>

          <div>
            <strong>Gender:</strong>{" "}
            {isEditing ? (
              <input
                className="border rounded px-2 py-1 ml-2"
                value={formData.gender || ""}
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.value })
                }
              />
            ) : (
              formData.gender || "—"
            )}
          </div>

          <div>
            <strong>Program:</strong>{" "}
            {isEditing ? (
              <input
                className="border rounded px-2 py-1 ml-2"
                value={formData.program || ""}
                onChange={(e) =>
                  setFormData({ ...formData, program: e.target.value })
                }
              />
            ) : (
              formData.program || "—"
            )}
          </div>

          <div>
            <strong>Status:</strong>{" "}
            {isEditing ? (
              <select
                className="border rounded px-2 py-1 ml-2"
                value={formData.status || "Active"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as ClientStatus,
                  })
                }
              >
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Inactive">Inactive</option>
              </select>
            ) : (
              <StatusBadge status={formData.status || "Active"} />
            )}
          </div>

          <div>
            <strong>Intake Date:</strong>{" "}
            {isEditing ? (
              <input
                type="date"
                className="border rounded px-2 py-1 ml-2"
                value={formData.intakeDate || ""}
                onChange={(e) =>
                  setFormData({ ...formData, intakeDate: e.target.value })
                }
              />
            ) : (
              formData.intakeDate || "—"
            )}
          </div>

          <div>
            <strong>Address:</strong>{" "}
            {isEditing ? (
              <input
                className="border rounded px-2 py-1 ml-2 w-full mt-1"
                value={formData.address || ""}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            ) : (
              formData.address || "—"
            )}
          </div>

          <div>
            <strong>Notes:</strong>
            {isEditing ? (
              <textarea
                className="w-full mt-1 border rounded px-2 py-1"
                rows={4}
                value={formData.notes || ""}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
            ) : (
              <p className="mt-1">{formData.notes || "—"}</p>
            )}
          </div>
        </div>

        <div className="mt-5 flex justify-between">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>Edit</Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setFormData({
                    ...client,
                    program: client.program || "",
                    status: client.status || "Active",
                    intakeDate: client.intakeDate || "",
                    address: client.address || "",
                    notes: client.notes || "",
                  });
                  setIsEditing(false);
                  setError(null);
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveChanges} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}

          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

// display table with live data
function ClientTable({
  clients,
  onNewClient,
  onImportStart,
  onExportClients,
  onExportServices,
  onSelectClient,
  loading,
  error,
  organizationId,
}: {
  clients: Client[];
  onNewClient: () => void;
  onImportStart: () => void;
  onExportClients: () => Promise<void>;
  onExportServices: () => Promise<void>;
  onSelectClient: (client: Client) => void;
  loading: boolean;
  error: string | null;
  organizationId: string;
}) {
  const [query, setQuery] = useState("");
  const [exportingClients, setExportingClients] = useState(false);
  const [exportingServices, setExportingServices] = useState(false);

  const rows = clients.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleExportClients = async () => {
    setExportingClients(true);
    try {
      await onExportClients();
    } finally {
      setExportingClients(false);
    }
  };

  const handleExportServices = async () => {
    setExportingServices(true);
    try {
      await onExportServices();
    } finally {
      setExportingServices(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            placeholder="Search clients..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={onImportStart}
            variant="outline"
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Import CSV
          </Button>
          <Button onClick={onNewClient} className="gap-2">
            <Plus className="h-4 w-4" />
            New Client
          </Button>
        </div>
      </div>

      <div className="flex gap-2 rounded-lg border border-zinc-200 bg-white p-3 items-center justify-between">
        <div className="text-sm text-zinc-600">
          <span className="font-medium">Export data:</span>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleExportClients}
            variant="outline"
            size="sm"
            disabled={exportingClients || clients.length === 0}
            className="gap-2 text-xs"
          >
            {exportingClients ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Upload className="h-3 w-3" />
            )}
            Clients
          </Button>
          <Button
            onClick={handleExportServices}
            variant="outline"
            size="sm"
            disabled={exportingServices}
            className="gap-2 text-xs"
          >
            {exportingServices ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Upload className="h-3 w-3" />
            )}
            Service Logs
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-white">
        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-t-lg border-b">
            Failed to load clients: {error}
          </div>
        )}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Date of Birth</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-zinc-400">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading clients...
                  </div>
                </TableCell>
              </TableRow>
            ) : rows.length > 0 ? (
              rows.map((c) => (
                <TableRow
                  key={c.id}
                  className="cursor-pointer hover:bg-zinc-50"
                  onClick={() => onSelectClient(c)}
                >
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{c.email || "—"}</TableCell>
                  <TableCell>{c.phone || "—"}</TableCell>
                  <TableCell>{c.dob || "—"}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell className="py-6 text-zinc-400" colSpan={4}>
                  No clients found. Add one to begin viewing client data!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

//nav bar

function Sidebar({ activeNav }: { activeNav: string }) {
  const router = useRouter();

  return (
    <aside className="flex w-56 flex-col border-r bg-white">
      <div className="flex h-14 items-center border-b px-4">
        <span className="text-sm font-semibold text-zinc-800">
          Nonprofit CMS
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {NAV_ITEMS.map(({ label, icon: Icon, route }) => {
          const active = activeNav === label;

          return (
            <button
              key={label}
              onClick={() => route !== "#" && router.push(route)}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition ${
                active
                  ? "bg-zinc-100 text-zinc-900 font-medium"
                  : "text-zinc-500 hover:bg-zinc-50"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
              {active && (
                <ChevronRight className="ml-auto h-4 w-4 text-zinc-400" />
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

//home/main page layout

export default function Dashboard() {
  const [activeNav, setActiveNav] = useState("Clients");
  const [newClientOpen, setNewClientOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);

  // Fetch user's organization on mount
  useEffect(() => {
    const fetchUserOrganization = async () => {
      try {
        const response = await fetch("/api/auth/me");
        const data = await response.json();

        if (!response.ok || !data.organizations || data.organizations.length === 0) {
          setError("No organization found. Please join or create an organization.");
          setLoading(false);
          return;
        }

        // Use the first organization
        const org = data.organizations[0];
        setOrganizationId(org.o_organizationkey);
      } catch (err) {
        console.error("Failed to fetch user organization:", err);
        setError("Failed to load organization information");
        setLoading(false);
      }
    };

    fetchUserOrganization();
  }, []);

  // Fetch clients when organization ID is set
  useEffect(() => {
    if (!organizationId) return;

    const fetchClients = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/clients?org_id=${encodeURIComponent(organizationId)}`
        );
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Failed to load clients");
          setClients([]);
          return;
        }

        setClients(data.clients || []);
      } catch (err) {
        console.error("Failed to fetch clients:", err);
        setError("An error occurred while loading clients");
        setClients([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [organizationId]);

  const handleClientCreated = (newClient: Client) => {
    setClients((prev) => [newClient, ...prev]);
  };

  const handleImportSuccess = (importedClients: Client[]) => {
    setClients((prev) => [...importedClients, ...prev]);
  };

  const handleExportClients = async () => {
    try {
      const response = await fetch(
        `/api/clients/export?org_id=${encodeURIComponent(organizationId || "")}`
      );
      if (!response.ok) {
        throw new Error("Failed to export clients");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `clients_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export clients:", err);
      alert("Failed to export clients. Please try again.");
    }
  };

  const handleExportServices = async () => {
    try {
      const response = await fetch(
        `/api/services/export?org_id=${encodeURIComponent(organizationId || "")}`
      );
      if (!response.ok) {
        throw new Error("Failed to export services");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `services_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export services:", err);
      alert("Failed to export services. Please try again.");
    }
  };

  return (
    <div className="flex h-screen bg-zinc-100">
      <Sidebar activeNav={activeNav} />

      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center border-b bg-white px-5">
          <p className="text-sm font-semibold text-zinc-700">{activeNav}</p>
        </header>

        <main className="flex-1 p-5">
          {activeNav === "Clients" ? (
            organizationId ? (
              <ClientTable
                clients={clients}
                onNewClient={() => setNewClientOpen(true)}
                onImportStart={() => setImportOpen(true)}
                onExportClients={handleExportClients}
                onExportServices={handleExportServices}
                onSelectClient={(client) => setSelectedClient(client)}
                loading={loading}
                error={error}
                organizationId={organizationId}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-zinc-400">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Loading...
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="mb-2">{error || "No organization found"}</p>
                    <p className="text-sm">
                      Please join or create an organization to view clients.
                    </p>
                  </div>
                )}
              </div>
            )
          ) : (
            <div className="flex h-full items-center justify-center text-zinc-400">
              {activeNav} page coming soon
            </div>
          )}
        </main>
      </div>

      {newClientOpen && organizationId && (
        <NewClientModal
          onClose={() => setNewClientOpen(false)}
          onClientCreated={handleClientCreated}
          organizationId={organizationId}
        />
      )}

      {importOpen && organizationId && (
        <ImportClientsModal
          onClose={() => setImportOpen(false)}
          onImportSuccess={handleImportSuccess}
          organizationId={organizationId}
        />
      )}

      {selectedClient && (
        <ClientProfileModal
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
          organizationId={organizationId || ""}
          onClientUpdated={(updatedClient) => {
            setClients((prev) =>
              prev.map((c) => (c.id === updatedClient.id ? updatedClient : c))
            );
            setSelectedClient(updatedClient);
          }}
        />
      )}
    </div>
  );
}