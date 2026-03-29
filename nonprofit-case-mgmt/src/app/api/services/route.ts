import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("org_id");
    const clientId = searchParams.get("client_id");

    if (!orgId) {
      return NextResponse.json(
        { error: "org_id is required" },
        { status: 400 }
      );
    }

    let query = supabase
      .from("service")
      .select(
        `
        s_servicekey,
        s_clientkey,
        s_date,
        s_type,
        s_notes,
        s_staffkey,
        s_servicetypekey
      `
      )
      .eq("s_organizationkey", orgId);

    if (clientId) {
      query = query.eq("s_clientkey", clientId);
    }

    const { data, error } = await query.order("s_date", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch services" },
        { status: 500 }
      );
    }

    // Fetch staff info and service type names separately
    const staffIds = Array.from(new Set(data?.map((s: any) => s.s_staffkey) || []));
    const serviceTypeIds = Array.from(new Set(data?.map((s: any) => s.s_servicetypekey).filter(Boolean) || []));
    
    let staffMap: Record<string, string> = {};
    let serviceTypeMap: Record<string, string> = {};

    if (staffIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("pf_id, pf_username")
        .in("pf_id", staffIds);

      if (profiles) {
        staffMap = Object.fromEntries(profiles.map(p => [p.pf_id, p.pf_username]));
      }
    }

    if (serviceTypeIds.length > 0) {
      const { data: types } = await supabase
        .from("service_types")
        .select("st_servicetypekey, st_name")
        .in("st_servicetypekey", serviceTypeIds);

      if (types) {
        serviceTypeMap = Object.fromEntries(types.map(t => [t.st_servicetypekey, t.st_name]));
      }
    }

    // Format the response
    const services = data?.map((service: any) => ({
      id: service.s_servicekey,
      clientId: service.s_clientkey,
      date: service.s_date,
      serviceType: serviceTypeMap[service.s_servicetypekey] || service.s_type || "Unknown",
      serviceTypeId: service.s_servicetypekey,
      staffId: service.s_staffkey,
      staffName: staffMap[service.s_staffkey] || "Unknown Staff",
      notes: service.s_notes,
    })) || [];

    return NextResponse.json({ services });
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );

    // Get user session
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      clientId,
      organizationId,
      staffId,
      date,
      serviceTypeId,
      notes,
    } = body;

    // Validate required fields
    if (!clientId || !organizationId || !date || !notes) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("service")
      .insert({
        s_clientkey: clientId,
        s_organizationkey: organizationId,
        s_staffkey: staffId || user.id,
        s_date: date,
        s_servicetypekey: serviceTypeId || null,
        s_notes: notes,
        s_createdby: user.id,
        s_updatedby: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to create service" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      service: {
        id: data.s_servicekey,
        clientId: data.s_clientkey,
        date: data.s_date,
        serviceType: data.s_type,
        serviceTypeId: data.s_servicetypekey,
        staffId: data.s_staffkey,
        notes: data.s_notes,
      },
    });
  } catch (error) {
    console.error("Error creating service:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
