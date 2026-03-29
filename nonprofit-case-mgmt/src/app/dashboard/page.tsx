"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  LayoutGrid,
  FileText,
  Building2,
  Settings,
  Search,
  ChevronRight,
  Plus,
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

// client types & status (to be adjusted/removed based on needings for backend)
//! WILL NEED TO BE UPDATED WHEN WIRING BACKEND !

type ClientStatus = "Active" | "Inactive" | "Pending";

export interface Client {
  id: string;
  name: string;
  program: string;
  intakeDate: string;
  status: ClientStatus;
  address: string;
  notes: string;
}

// mock data for visualization purposes-- to be deleted after wiring complete 
//! WILL NEED TO BE UPDATED (deleted) WHEN WIRING BACKEND !

const MOCK_CLIENTS: Client[] = [
  {
    id: "C-1041",
    name: "Benny Bop",
    program: "p1",
    intakeDate: "2001-06-07",
    status: "Active",
    address: "412 W Goober St",
    notes: "A silly goober.",
  },
  {
    id: "C-1042",
    name: "Harry Styles",
    program: "p4",
    intakeDate: "2025-04-20",
    status: "Active",
    address: "69 N Nuggets Ave",
    notes: "Stream Kiss All The Time, Disco Occasionally.",
  },
];

//nav items, used by nav bar
const NAV_ITEMS = [
  { label: "Clients", icon: Users, route: "/dashboard" },
  { label: "Reports", icon: FileText, route: "#" },
  { label: "Organizations", icon: Building2, route: "/org" },
  { label: "Programs", icon: LayoutGrid, route: "#" },
  { label: "Settings", icon: Settings, route: "#" },
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

// new client pop up UI, update shown text once it is no longer UI only
//! WILL NEED TO BE UPDATED WHEN WIRING BACKEND !
// sample UI for something needing a drop down menu, such as program, update based on backend demographics to be linked to client profile
// ! WILL NEED TO BE UPDATED WHEN WIRING BACKEND !

function NewClientModal({ onClose }: { onClose: () => void }) {
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
              UI only for now, no save capability
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
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-600">First Name</label>
            <input
              type="text"
              placeholder="Enter first name"
              className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-400"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-600">Last Name</label>
            <input
              type="text"
              placeholder="Enter last name"
              className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-400"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-600">Program</label>
            <select className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-400">
              <option>Select a program</option>
              <option>p1</option>
              <option>p2</option>
              <option>p3</option>
              <option>p4</option>
              <option>p5</option>
            </select>
          </div>

          <div className="md:col-span-2 flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-600">Address</label>
            <input
              type="text"
              placeholder="Enter address"
              className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-400"
            />
          </div>

          <div className="md:col-span-2 flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-600">Notes</label>
            <textarea
              rows={4}
              placeholder="Add notes"
              className="resize-none rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-400"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-zinc-100 px-6 py-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onClose}>Save Client</Button>
        </div>
      </div>
    </div>
  );
}

//pop up for client profile :D right now has foofoo components for editing later down
//update once backend wired

function ClientProfileModal({ client, onClose }: { client: Client; onClose: () => void }) {
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState(client);

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
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            ) : (
              <h2 className="text-lg font-semibold">{client.name}</h2>
            )}
            <p className="text-sm text-zinc-500">ID: {client.id}</p>
          </div>

          <button
            onClick={onClose}
            className="rounded-md px-2 py-1 text-zinc-400 hover:bg-zinc-100"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-3 text-sm">
          <div>
            <strong>Program:</strong>{" "}
            {isEditing ? (
              <input
                className="border rounded px-2 py-1 ml-2"
                value={formData.program}
                onChange={(e) =>
                  setFormData({ ...formData, program: e.target.value })
                }
              />
            ) : (
              client.program
            )}
          </div>

          <div>
            <strong>Status:</strong>{" "}
            {isEditing ? (
              <select
                className="border rounded px-2 py-1 ml-2"
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as ClientStatus,
                  })
                }
              >
                <option>Active</option>
                <option>Pending</option>
                <option>Inactive</option>
              </select>
            ) : (
              client.status
            )}
          </div>

          <div>
            <strong>Intake Date:</strong>{" "}
            {isEditing ? (
              <input
                type="date"
                className="border rounded px-2 py-1 ml-2"
                value={formData.intakeDate}
                onChange={(e) =>
                  setFormData({ ...formData, intakeDate: e.target.value })
                }
              />
            ) : (
              client.intakeDate
            )}
          </div>

          <div>
            <strong>Address:</strong>{" "}
            {isEditing ? (
              <input
                className="border rounded px-2 py-1 ml-2 w-full mt-1"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            ) : (
              client.address
            )}
          </div>

          <div>
            <strong>Notes:</strong>
            {isEditing ? (
              <textarea
                className="w-full mt-1 border rounded px-2 py-1"
                rows={4}
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
            ) : (
              <p className="mt-1">{client.notes}</p>
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
                  setFormData(client);
                  setIsEditing(false);
                }}
              >
                Cancel
              </Button>
              <Button onClick={() => setIsEditing(false)}>
                Save Changes
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

// display table-- to be wired into backend 
//update quick info displayed for client based on backend demographics 
//! WILL NEED TO BE UPDATED WHEN WIRING BACKEND !

function ClientTable({
  clients,
  onNewClient,
  onClientClick,
}: {
  clients: Client[];
  onNewClient: () => void;
  onClientClick: (client: Client) => void;
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Program</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {rows.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <button
                    onClick={() => onClientClick(c)}
                    className="font-medium hover:underline"
                  >
                    {c.name}
                  </button>
                </TableCell>
                <TableCell>{c.program}</TableCell>
                <TableCell>
                  <StatusBadge status={c.status} />
                </TableCell>
              </TableRow>
            ))}

            {rows.length === 0 && (
              <TableRow>
                <TableCell className="py-6 text-zinc-400" colSpan={3}>
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
}: {
  activeNav: string;
}) {
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
              onClick={() => {
                if (route !== "#") router.push(route);
              }}
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

export default function Da() {
  const [newClientOpen, setNewClientOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  return (
    <div className="flex h-screen bg-zinc-100">
      <Sidebar activeNav="Clients" />

      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center border-b bg-white px-5">
          <p className="text-sm font-semibold text-zinc-700">Clients</p>
        </header>

        <main className="flex-1 p-5">
          <ClientTable
            clients={MOCK_CLIENTS}
            onNewClient={() => setNewClientOpen(true)}
            onClientClick={(c) => setSelectedClient(c)}
          />
        </main>
      </div>

      {newClientOpen && (
        <NewClientModal onClose={() => setNewClientOpen(false)} />
      )}

      {selectedClient && (
        <ClientProfileModal
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
        />
      )}
    </div>
  );
}