// src/app/api/menu/route.ts

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

interface MenuItem {
  id: number;
  category: string;
  name: string;
  description: string;
  price: number;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");

  try {
    let query = supabase
      .from("menu")
      .select("*")
      .order("category", { ascending: true })
      .order("id", { ascending: true });

    // Filter by category if provided
    if (category) {
      query = query.eq("category", category);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Group items by category for easier frontend consumption
    const groupedMenu: Record<string, MenuItem[]> = {};
    
    data.forEach((item: MenuItem) => {
      if (!groupedMenu[item.category]) {
        groupedMenu[item.category] = [];
      }
      groupedMenu[item.category].push(item);
    });

    return NextResponse.json({
      success: true,
      items: data,
      grouped: groupedMenu,
      categories: Object.keys(groupedMenu)
    });

  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}