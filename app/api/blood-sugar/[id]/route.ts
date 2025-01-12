import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      )
    }

    const record = await prisma.bloodSugarRecord.delete({
      where: {
        id: params.id,
        userId: userId
      }
    })

    return NextResponse.json(record)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error deleting record' }, 
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      )
    }

    const body = await request.json()
    const record = await prisma.bloodSugarRecord.update({
      where: {
        id: params.id,
        userId: userId
      },
      data: {
        ...body,
        bloodSugar: parseFloat(body.bloodSugar)
      }
    })

    return NextResponse.json(record)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error updating record' }, 
      { status: 500 }
    )
  }
} 