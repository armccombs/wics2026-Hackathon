"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Users,
  Plus,
  Search,
  CalendarDays,
  X,
  Building2,
  LayoutGrid,
  Settings,
  ChevronRight,
  Loader2,
} from "lucide-react";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";


// nav items
const NAV_ITEMS = [
  { label: "Clients", icon: Users, route: "/dashboard" },
  { label: "Reports", icon: FileText, route: "/reports" },
  { label: "Organizations", icon: Building2, route: "/org" },
  { label: "Programs", icon: LayoutGrid, route: "#" },
  { label: "Settings", icon: Settings, route: "/account" },
];

// navbar
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


// client placeholder, update based on backend wiring if needed, creates object of type Client
type Client = {
  id: string;
  name: string;
  fullName?: string;
};

type ServiceType = {
  id: string;
  name: string;
  description?: string;
};

type ServiceEntry = {
  id: string;
  clientId: string;
  date: string;
  serviceType: string;
  serviceTypeId?: string;
  staffMember: string;
  staffId?: string;
  notes: string;
};


// hard coded temp data , will need to be updated once backend wired so values pull from supabase
// BACKEND WIRING: replace with fetched client data from database
const initialClients: Client[] = [];

// update via backend, should be configurable
// BACKEND WIRING: replace with service types coming from database
const initialServiceTypes: ServiceType[] = [];

// placeholder for display purposes
// BACKEND WIRING: replace with service log records pulled from database
const initialEntries: ServiceEntry[] = [];


// placeholder - later pull from auth/backend
// ! WIRE INTO BACKEND !
// BACKEND WIRING: replace with actual logged-in staff member from auth/session/user table
function getCurrentStaffMember(): string {
  return "Staff Member"; // replace with actual logged-in user
}


// page logic & display
export default function ReportsPage() {
  /* local states*/

  const [clients, setClients] = useState<Client[]>([]);
  const [entries, setEntries] = useState<ServiceEntry[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);

  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [currentStaffId, setCurrentStaffId] = useState<string | null>(null);
  const [currentStaffName, setCurrentStaffName] = useState("Staff Member");

  const [loading, setLoading] = useState(true);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // search bar value for filtering the client list
  const [searchQuery, setSearchQuery] = useState("");

  // tracks which client is currently selected in the popups
  const [selectedClientId, setSelectedClientId] = useState<string>("");

  // modal controls
  const [showClientModal, setShowClientModal] = useState(false);
  const [showAddLogModal, setShowAddLogModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // form data holders
  const [formData, setFormData] = useState({
    date: "",
    serviceTypeId: "",
    notes: "",
  });

  // Fetch user's organization and auth info on mount
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch("/api/auth/me");
        const data = await response.json();

        if (!response.ok || !data.organizations || data.organizations.length === 0) {
          setError("No organization found. Please join or create an organization.");
          setLoading(false);
          return;
        }

        const firstOrg = data.organizations[0];
        const orgId = firstOrg.o_organizationkey || firstOrg.id || firstOrg.organizationId;
        setOrganizationId(orgId);

        // Set current staff member
        if (data.user) {
          setCurrentStaffId(data.user.id);
          setCurrentStaffName(data.user.email?.split("@")[0] || "Staff Member");
        }

        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch user info:", err);
        setError("Failed to load authentication information");
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  // Fetch clients and service types when organization is set
  useEffect(() => {
    if (!organizationId) return;

    const fetchClientsAndTypes = async () => {
      try {
        // Fetch clients
        const clientsResponse = await fetch(
          `/api/clients?org_id=${encodeURIComponent(organizationId)}`
        );
        const clientsData = await clientsResponse.json();

        if (clientsResponse.ok && clientsData.clients) {
          const formattedClients: Client[] = clientsData.clients.map((client: any) => ({
            id: client.c_clientkey || client.id,
            name: client.c_fullname || client.fullName || client.name,
            fullName: client.c_fullname || client.fullName,
          }));
          setClients(formattedClients);
        } else {
          console.error("Failed to fetch clients:", clientsData.error);
        }

        // Fetch service types
        const typesResponse = await fetch(
          `/api/services/types?org_id=${encodeURIComponent(organizationId)}`
        );
        const typesData = await typesResponse.json();

        if (typesResponse.ok && typesData.types) {
          const formattedTypes: ServiceType[] = typesData.types.map((type: any) => ({
            id: type.id,
            name: type.name,
            description: type.description,
          }));
          setServiceTypes(formattedTypes);
          
          // Set default service type if available
          if (formattedTypes.length > 0) {
            setFormData((prev) => ({
              ...prev,
              serviceTypeId: formattedTypes[0].id,
            }));
          }
        } else {
          console.error("Failed to fetch service types:", typesData.error);
        }
      } catch (err) {
        console.error("Failed to fetch clients and service types:", err);
        setError("Failed to load data");
      }
    };

    fetchClientsAndTypes();
  }, [organizationId]);

  // Fetch service entries for selected client
  useEffect(() => {
    if (!selectedClientId || !organizationId) {
      setEntries([]);
      return;
    }

    const fetchEntries = async () => {
      setLoadingEntries(true);
      try {
        const response = await fetch(
          `/api/services?org_id=${encodeURIComponent(organizationId)}&client_id=${encodeURIComponent(selectedClientId)}`
        );
        const data = await response.json();

        if (response.ok && data.services) {
          const formattedEntries: ServiceEntry[] = data.services.map((service: any) => ({
            id: service.id,
            clientId: service.clientId,
            date: service.date,
            serviceType: service.serviceType,
            serviceTypeId: service.serviceTypeId,
            staffMember: service.staffName,
            staffId: service.staffId,
            notes: service.notes,
          }));
          setEntries(formattedEntries);
        } else {
          console.error("Failed to fetch service entries:", data.error);
        }
      } catch (err) {
        console.error("Failed to fetch service entries:", err);
      } finally {
        setLoadingEntries(false);
      }
    };

    fetchEntries();
  }, [selectedClientId, organizationId]);

  /* derived data*/

  // client search
  const filteredClients = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return clients;

    return clients.filter((client) => {
      return (
        client.name.toLowerCase().includes(query) ||
        client.id.toLowerCase().includes(query)
      );
    });
  }, [clients, searchQuery]);

  // finds the client object that matches the selected id
  const selectedClient = clients.find((client) => client.id === selectedClientId);

  // builds the report history for the selected client and keeps it in chronological order
  const selectedClientEntries = useMemo(() => {
    return entries
      .filter((entry) => entry.clientId === selectedClientId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [entries, selectedClientId]);

  /*modal helpders*/

  // opens client log history popup after a client is clicked
  const openClientModal = (clientId: string) => {
    setSelectedClientId(clientId);
    setShowClientModal(true);
  };

  // closes the client history popup
  const closeClientModal = () => {
    setShowClientModal(false);
  };

  // opens the service log creation modal
  const openAddLogModal = () => {
    if (!selectedClientId) return;
    setShowAddLogModal(true);
  };

  // set up form data on pop up for service log instance
  const closeAddLogModal = () => {
    setShowAddLogModal(false);
    setFormData({
      date: "",
      serviceTypeId: serviceTypes[0]?.id ?? "",
      notes: "",
    });
  };

  /* new entry*/

  const handleAddEntry = async () => {
    // Validation with feedback
    if (!organizationId) {
      alert("Organization not loaded. Please refresh the page.");
      return;
    }

    if (!selectedClientId) {
      alert("Please select a client first");
      return;
    }

    if (!formData.date) {
      alert("Please select a date");
      return;
    }

    if (!formData.serviceTypeId) {
      alert("Please select a service type");
      return;
    }

    if (!formData.notes.trim()) {
      alert("Please enter notes");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        clientId: selectedClientId,
        organizationId,
        staffId: currentStaffId,
        date: formData.date,
        serviceTypeId: formData.serviceTypeId,
        notes: formData.notes.trim(),
      };
      
      console.log("Submitting service entry with payload:", payload);

      const response = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("Service creation response:", data);

      if (!response.ok) {
        console.error("Service creation error:", data);
        alert(data.error || "Failed to create service log");
        return;
      }

      // Add the new entry to local state
      const newEntry: ServiceEntry = {
        id: data.service?.id || crypto.randomUUID(),
        clientId: selectedClientId,
        date: formData.date,
        serviceType: formData.serviceTypeId,
        serviceTypeId: formData.serviceTypeId,
        staffMember: currentStaffName,
        staffId: currentStaffId || undefined,
        notes: formData.notes.trim(),
      };

      setEntries((prev) => [...prev, newEntry]);
      closeAddLogModal();
    } catch (err) {
      console.error("Error creating service entry:", err);
      alert("An error occurred while creating the service log");
    } finally {
      setSubmitting(false);
    }
  };

  /* page rendering*/

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="flex min-h-screen">
          <Sidebar activeNav="Reports" />
          <main className="flex-1 flex items-center justify-center">
            <div className="flex items-center gap-2 text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading...
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="flex min-h-screen">
          <Sidebar activeNav="Reports" />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center text-slate-500">
              <p className="mb-2">{error}</p>
              <p className="text-sm">Please try again later or contact support.</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  /* page rendering*/

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        <Sidebar activeNav="Reports" />

        <main className="flex-1 px-6 py-8">
          <div className="mx-auto max-w-5xl">
            {/* page heading */}
            <div className="mb-8 flex items-center gap-3">
              <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
                <FileText className="h-6 w-6 text-slate-700" />
              </div>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                  Reports
                </h1>
                <p className="text-sm text-slate-500">
                  Search clients and view service logs.
                </p>
              </div>
            </div>

            {/* searchable list of clients */}
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <div className="relative mb-5">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by client name or ID"
                  className="pl-9"
                />
              </div>

              <div className="space-y-3">
                {filteredClients.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                    No clients match your search.
                  </div>
                ) : (
                  filteredClients.map((client) => (
                    <button
                      key={client.id}
                      onClick={() => openClientModal(client.id)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-left transition hover:border-slate-300 hover:bg-slate-100"
                    >
                      <div className="font-medium text-slate-900">{client.name}</div>
                      <div className="mt-1 text-xs text-slate-500">
                        Client ID: {client.id}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* report modal */}
      {showClientModal && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-4xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">Selected Client</p>
                <h3 className="text-xl font-semibold text-slate-900">
                  {selectedClient.name}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Client ID: {selectedClient.id}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  // button is for adding new service log, calls modal logic to allow for editing & updating
                  onClick={openAddLogModal}
                  className="rounded-xl"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Service Log
                </Button>

                <button
                  onClick={closeClientModal}
                  className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Close client modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* content of report , shows selected client*/}
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <div className="mb-5 flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-slate-600" />
                <h2 className="text-xl font-semibold text-slate-900">
                  Service Log History
                </h2>
              </div>

              {loadingEntries ? (
                <div className="flex items-center justify-center py-10">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading service logs...
                  </div>
                </div>
              ) : selectedClientEntries.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
                  No service logs yet for this client.
                </div>
              ) : (
                <div className="max-h-105 space-y-4 overflow-y-auto pr-1">
                  {selectedClientEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                    >
                      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-sm text-slate-500">Service Type</p>
                          <p className="font-semibold text-slate-900">
                            {entry.serviceType}
                          </p>
                        </div>

                        <div className="text-sm text-slate-600 sm:text-right">
                          <p>
                            <span className="font-medium text-slate-700">Date:</span>{" "}
                            {entry.date}
                          </p>
                          <p>
                            <span className="font-medium text-slate-700">Staff:</span>{" "}
                            {entry.staffMember}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="mb-1 text-sm text-slate-500">Notes</p>
                        <p className="text-sm leading-6 text-slate-700">
                          {entry.notes}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ADD SERVICE LOG MODAL, I believe should not need to be updated for backend wiring since the wiring should happen in the value names towsrds top of file, but throwing comment just incase  */}
      {showAddLogModal && (
        <div className="fixed inset-z-60 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">
                  Add Service Log
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Logging for {selectedClient?.name ?? "selected client"}
                </p>
              </div>

              <button
                onClick={closeAddLogModal}
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* form grid for new service log */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Date
                </label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, date: e.target.value }))
                  }
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Service Type
                </label>
                <select
                  value={formData.serviceTypeId}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      serviceTypeId: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-400"
                >
                  <option value="">-- Select a service type --</option>
                  {serviceTypes.length > 0 ? (
                    serviceTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))
                  ) : (
                    <option disabled>Loading service types...</option>
                  )}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Staff Member
                </label>
                <div className="rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-700">
                  {currentStaffName}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Notes
                </label>
                <textarea
                  rows={5}
                  placeholder="Add service notes here..."
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                />
              </div>
            </div>

            {/* modal action buttons */}
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={closeAddLogModal}
                className="rounded-xl"
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button onClick={handleAddEntry} className="rounded-xl" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {submitting ? "Saving..." : "Save Log"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}