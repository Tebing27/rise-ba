import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

interface ImportBloodSugarData {
  date: string;
  time: string;
  bloodSugar: number;
  age: string;
  type: string;
  description: string;
  condition: string;
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { records } = body as { records: ImportBloodSugarData[] };

    // Simpan semua record yang diimpor
    for (const record of records) {
      await db.bloodSugarRecord.create({
        data: {
          ...record,
          userId
        }
      });
    }

    // Ambil data terbaru
    const updatedRecords = await db.bloodSugarRecord.findMany({
      where: {
        userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(updatedRecords);
  } catch (error) {
    console.error("[BLOOD_SUGAR_IMPORT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 