import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const platformId = searchParams.get('platformId');

        const where: any = {};

        if (platformId && platformId !== 'all') {
            where.platforms = {
                some: { id: platformId }
            };
        }

        const products = await prisma.product.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                platforms: true, // Corrected from category: true
                channel: true,
            }
        });

        return NextResponse.json({ success: true, data: products });
    } catch (error) {
        console.error('Fetch products error:', error);
        return NextResponse.json({ success: false, error: '获取商品失败' }, { status: 500 });
    }
}
