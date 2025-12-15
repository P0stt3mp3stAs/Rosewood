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

  /**
   * Overlapping logic:
   * reservation.time_from < selected_to
   * AND reservation.time_to > selected_from
   */
  const { data, error } = await supabase
    .from("reservations")
    .select("seat_id")
    .eq("date", date)
    .eq("is_active", true)
    .or(`and(time_from.lt.${to},time_to.gt.${from})`);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    reservedSeats: data.map((r) => r.seat_id),
  });
}
