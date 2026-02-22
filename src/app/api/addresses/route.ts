import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams
		const userId = searchParams.get('userId')
		const city = searchParams.get('city')
		const street = searchParams.get('street')

		if (!userId) {
			return NextResponse.json(
				{ error: 'Missing userId parameter' },
				{ status: 400 },
			)
		}

		const where: any = { userId: parseInt(userId, 10) }

		if (city && street) {
			where.city = city
			where.street = street
		}

		const address = await prisma.address.findFirst({
			where,
		})

		return NextResponse.json(address || null)
	} catch (error) {
		console.error('Error fetching address:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch address' },
			{ status: 500 },
		)
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json()
		const { userId, city, street, postCode } = body

		if (!userId || !city || !street) {
			return NextResponse.json(
				{ error: 'Missing required fields' },
				{ status: 400 },
			)
		}

		const address = await prisma.address.create({
			data: {
				userId: parseInt(userId, 10),
				city,
				street,
				postCode: postCode || '',
			},
		})

		return NextResponse.json(address, { status: 201 })
	} catch (error) {
		console.error('Error creating address:', error)
		return NextResponse.json(
			{ error: 'Failed to create address' },
			{ status: 500 },
		)
	}
}

