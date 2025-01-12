import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth, currentUser } from '@clerk/nextjs/server'

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Cek apakah user sudah ada di database
    let user = await prisma.user.findUnique({
      where: { id: userId }
    })

    // Jika belum ada, buat user baru
    if (!user) {
      const clerkUser = await currentUser()
      user = await prisma.user.create({
        data: {
          id: userId,
          email: clerkUser?.emailAddresses[0]?.emailAddress ?? ''
        }
      })
    }

    const record = await prisma.bloodSugarRecord.create({
      data: {
        ...body,
        userId: userId,
        bloodSugar: parseFloat(body.bloodSugar)
      }
    })
    
    return NextResponse.json(record)
  } catch (error) {
    console.error('Error creating record:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menyimpan data' }, 
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      )
    }

    const records = await prisma.bloodSugarRecord.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json(records)
  } catch (error) {
    console.error('Error fetching records:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data' }, 
      { status: 500 }
    )
  }
} 