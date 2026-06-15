import { NextResponse } from "next/server";
import { accounts } from "@/lib/demoData";
import type { Account } from "@/lib/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  _request: Request,
  { params }: RouteParams
): Promise<NextResponse<Account | { error: string }>> {
  const { id } = await params;
  const account = accounts.find((a) => a.id === id);

  if (!account) {
    return NextResponse.json({ error: `Account ${id} not found` }, { status: 404 });
  }

  return NextResponse.json(account);
}
