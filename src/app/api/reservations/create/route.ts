// src/app/api/reservations/create/route.ts

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

interface ReservationBody {
  seat_id: string | number;
  date: string;
  time_from: string;
  time_to: string;
  name: string;
  email: string;
  phone: string;
  passcode: string;
  menu_items?: string[];
}

interface ReservationRecord {
  id: string;
  seat_id: string;
  date: string;
  time_from: string;
  time_to: string;
  name: string;
  email: string;
  phone: string;
  passcode: string;
  menu_items: string[];
  is_active: boolean;
  created_at?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as ReservationBody;
    
    const {
      seat_id,
      date,
      time_from,
      time_to,
      name,
      email,
      phone,
      passcode,
      menu_items = []
    } = body;
    
    // Validate required fields
    if (!seat_id || !date || !time_from || !time_to || !name || !email || !phone || !passcode) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }
    
    // Validate phone (basic validation)
    if (phone.length < 5) {
      return NextResponse.json(
        { error: "Phone number is too short" },
        { status: 400 }
      );
    }
    
    // Validate passcode - must be exactly 4 digits
    const passcodeRegex = /^\d{4}$/;
    if (!passcodeRegex.test(passcode)) {
      return NextResponse.json(
        { error: "Passcode must be exactly 4 digits" },
        { status: 400 }
      );
    }
    
    // First, check if the seat is already reserved for this time slot
    const { data: existingReservations, error: checkError } = await supabase
      .from("reservations")
      .select("id")
      .eq("seat_id", seat_id)
      .eq("date", date)
      .eq("is_active", true)
      .lt("time_from", time_to)
      .gt("time_to", time_from);
    
    if (checkError) {
      console.error("Error checking existing reservations:", checkError);
      return NextResponse.json(
        { error: "Error checking availability" },
        { status: 500 }
      );
    }
    
    if (existingReservations && existingReservations.length > 0) {
      return NextResponse.json(
        { error: "This table is already reserved for the selected time" },
        { status: 409 }
      );
    }
    
    // Create the reservation
    const { data, error } = await supabase
      .from("reservations")
      .insert([
        {
          seat_id: seat_id.toString(), // Store as string as per your schema
          date,
          time_from,
          time_to,
          name,
          email,
          phone,
          passcode, // Store the passcode
          menu_items,
          is_active: true
        }
      ])
      .select()
      .single();
    
    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to create reservation" },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: "Reservation created successfully",
      reservation: data
    });
    
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}