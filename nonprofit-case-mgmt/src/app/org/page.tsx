"use client";

import { useRouter } from "next/navigation";

import {
  Users,
  LayoutGrid,
  FileText,
  Settings,
  ChevronRight,
  Building2,
  Plus,
  UserPlus,
} from "lucide-react";

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

// page
export default function OrganizationsPage() {
     const router = useRouter();
  return (
    <div className="flex h-screen bg-zinc-100">
      <Sidebar activeNav="Organizations" />

      <div className="flex flex-1 flex-col p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-zinc-900">
            Organization Management
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            endpoint for user organization viewing/managing 
          </p>
        </div>

        {/* Button, Nav to Other Pages*/}
        <div className="grid gap-4 md:grid-cols-3">
          <button
          onClick={() => router.push("/org/view")} 
          className="flex flex-col gap-3 rounded-xl border bg-white p-5 text-left shadow-sm transition hover:border-zinc-300 hover:shadow">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-zinc-600" />
              <h2 className="text-base font-semibold text-zinc-900">
                View Organizations
              </h2>
            </div>

            <p className="text-sm text-zinc-500">
              See organizations you are currently part of and manage them.
            </p>
          </button>

          <button 
            onClick={() => router.push("/org/create")}
            className="flex flex-col gap-3 rounded-xl border bg-white p-5 text-left shadow-sm transition hover:border-zinc-300 hover:shadow">
            <div className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-zinc-600" />
              <h2 className="text-base font-semibold text-zinc-900">
                Create Organization
              </h2>
            </div>

            <p className="text-sm text-zinc-500">
              Add a new nonprofit organization into the system.
            </p>
          </button>

          <button 
            onClick={() => router.push("/org/join")}
            className="flex flex-col gap-3 rounded-xl border bg-white p-5 text-left shadow-sm transition hover:border-zinc-300 hover:shadow">
            <div className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-zinc-600" />
              <h2 className="text-base font-semibold text-zinc-900">
                Join Organization
              </h2>
            </div>

            <p className="text-sm text-zinc-500">
              Enter an invite code to an existing organization. Contact organization admin for invite code. 
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}