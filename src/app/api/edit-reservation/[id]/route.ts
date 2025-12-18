// src/app/api/edit-reservation/[id]/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }  // params is a Promise!
) {
  console.log("✅ API CALLED: GET /api/edit-reservation/[id]");

  try {
    // AWAIT the params first!
    const { id } = await params;
    const url = new URL(request.url);
    const passcode = url.searchParams.get("passcode");

    console.log("Params resolved - ID:", id, "Type:", typeof id);
    console.log("Full URL:", request.url);
    console.log("Passcode:", passcode);

    if (!passcode) {
      return NextResponse.json(
        { error: "Passcode required" },
        { status: 400 }
      );
    }

    // Convert ID to number since your database uses integer IDs
    const reservationId = parseInt(id, 10);
    
    if (isNaN(reservationId)) {
      return NextResponse.json(
        { error: "Invalid reservation ID" },
        { status: 400 }
      );
    }

    console.log("📡 Querying Supabase for ID:", reservationId, "Type:", typeof reservationId);
    
    // Check if reservation exists
    const { data, error } = await supabase
      .from("reservations")
      .select("*")
      .eq("id", reservationId)  // Use the number here
      .single();

    console.log("Supabase response - Data:", data);
    console.log("Supabase response - Error:", error);

    if (error) {
      console.error("Supabase error details:", error);
      return NextResponse.json(
        { error: "Reservation not found in database" },
        { status: 404 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "No reservation data returned" },
        { status: 404 }
      );
    }

    // Check passcode
    console.log("Checking passcode. DB passcode:", data.passcode, "Input:", passcode);
    if (data.passcode !== passcode) {
      return NextResponse.json(
        { error: "Wrong passcode" },
        { status: 401 }
      );
    }

    console.log("✅ Success! Returning reservation");
    return NextResponse.json({
      reservation: data
    });

  } catch (error) {
    console.error("❌ API error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }  // params is a Promise!
) {
  console.log("✅ API CALLED: PATCH /api/edit-reservation/[id]");

  try {
    // AWAIT the params first!
    const { id } = await params;
    const body = await request.json();
    const { passcode, updates } = body;

    console.log("Params resolved - ID:", id);
    console.log("Request body:", { passcode, updates });

    if (!passcode) {
      return NextResponse.json(
        { error: "Passcode required" },
        { status: 400 }
      );
    }

    // Convert ID to number
    const reservationId = parseInt(id, 10);
    
    if (isNaN(reservationId)) {
      return NextResponse.json(
        { error: "Invalid reservation ID" },
        { status: 400 }
      );
    }

    console.log("📡 Verifying reservation ID:", reservationId);

    // First verify passcode
    const { data: existing, error: fetchError } = await supabase
      .from("reservations")
      .select("passcode")
      .eq("id", reservationId)
      .single();

    if (fetchError || !existing) {
      console.error("Fetch error:", fetchError);
      return NextResponse.json(
        { error: "Reservation not found" },
        { status: 404 }
      );
    }

    console.log("Existing passcode:", existing.passcode, "Input passcode:", passcode);
    
    if (existing.passcode !== passcode) {
      return NextResponse.json(
        { error: "Wrong passcode" },
        { status: 401 }
      );
    }

    console.log("✅ Passcode verified, updating...");

    // Update the reservation
    const { data, error } = await supabase
      .from("reservations")
      .update(updates)
      .eq("id", reservationId)
      .select()
      .single();

    if (error) {
      console.error("Update error:", error);
      return NextResponse.json(
        { error: "Update failed: " + error.message },
        { status: 500 }
      );
    }

    console.log("✅ Update successful!");
    return NextResponse.json({
      success: true,
      reservation: data
    });

  } catch (error) {
    console.error("❌ PATCH error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}