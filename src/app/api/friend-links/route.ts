import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const admin = searchParams.get('admin') === 'true';

        const friendLinks = await prisma.friendLink.findMany({
            where: admin ? {} : { isActive: true },
            orderBy: { sortOrder: 'asc' },
        });

        return NextResponse.json({ success: true, data: friendLinks });
    } catch (error) {
        console.error('Fetch friend links error:', error);
        return NextResponse.json({ success: false, error: '获取友情链接失败' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { name, url, logo, sortOrder, isActive } = body;

        if (!name || !url) {
            return NextResponse.json({ success: false, error: '名称和链接必填' }, { status: 400 });
        }

        const friendLink = await prisma.friendLink.create({
            data: {
                name,
                url,
                logo: logo || null,
                sortOrder: sortOrder || 0,
                isActive: isActive ?? true,
            },
        });

        return NextResponse.json({ success: true, data: friendLink });
    } catch (error) {
        console.error('Create friend link error:', error);
        return NextResponse.json({ success: false, error: '创建友情链接失败' }, { status: 500 });
    }
}
