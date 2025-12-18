// src/app/api/test-db/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    console.log("Testing Supabase connection...");
    
    const { data, error } = await supabase
      .from("reservations")
      .select("id, name, passcode")
      .limit(50);

    console.log("Test results:", { data, error });

    return NextResponse.json({
      success: true,
      data,
      error: error?.message,
      count: data?.length
    });
  } catch (error) {
    console.error("Test failed:", error);
    return NextResponse.json({
      success: false,
      error: String(error)
    });
  }
}