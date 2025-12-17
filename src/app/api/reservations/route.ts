// src/app/api/reservations/route.ts

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const date = searchParams.get("date");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!date || !from || !to) {
    return NextResponse.json(
      { error: "Missing date or time" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("reservations")
    .select("seat_id")
    .eq("date", date)
    .eq("is_active", true)
    .lt("time_from", to)
    .gt("time_to", from);

  if (error) {
    console.error("Supabase error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // ✅ CRITICAL FIX: Convert seat_id from string to number
  const reservedSeatIds = data.map((r) => Number(r.seat_id));

  return NextResponse.json({
    reservedSeats: reservedSeatIds, // Now an array of numbers [1]
  });
}