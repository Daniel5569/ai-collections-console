import { NextResponse } from "next/server";
import { accounts } from "@/lib/demoData";
import type { Account } from "@/lib/types";

export async function GET(): Promise<NextResponse<Account[]>> {
  return NextResponse.json(accounts);
}
