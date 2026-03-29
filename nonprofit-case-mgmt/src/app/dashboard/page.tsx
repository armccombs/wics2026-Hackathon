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
} from "lucide-react";

import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

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
}

// nav items

const NAV_ITEMS = [
  { label: "Clients", icon: Users },
  { label: "Programs", icon: LayoutGrid },
  { label: "Reports", icon: FileText },
  { label: "Documents", icon: FolderOpen },
  { label: "Settings", icon: Settings },
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

// display table with live data
function ClientTable({
  clients,
  onNewClient,
  loading,
  error,
}: {
  clients: Client[];
  onNewClient: () => void;
  loading: boolean;
  error: string | null;
}) {
  const [query, setQuery] = useState("");

  const rows = clients.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

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

        <Button onClick={onNewClient} className="gap-2">
          <Plus className="h-4 w-4" />
          New Client
        </Button>
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
                <TableRow key={c.id}>
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

function Sidebar({
  activeNav,
  onNav,
}: {
  activeNav: string;
  onNav: (label: string) => void;
}) {
  return (
    <aside className="flex w-56 flex-col border-r bg-white">
      <div className="flex h-14 items-center border-b px-4">
        <span className="text-sm font-semibold text-zinc-800">
          Nonprofit CMS
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {NAV_ITEMS.map(({ label, icon: Icon }) => {
          const active = activeNav === label;

          return (
            <button
              key={label}
              onClick={() => onNav(label)}
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

  return (
    <div className="flex h-screen bg-zinc-100">
      <Sidebar activeNav={activeNav} onNav={setActiveNav} />

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
                loading={loading}
                error={error}
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
    </div>
  );
}