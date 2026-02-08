import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { id, name, url, logo, sortOrder, isActive } = body;

        const friendLink = await prisma.friendLink.update({
            where: { id: params.id },
            data: {
                name,
                url,
                logo,
                sortOrder,
                isActive
            }
        });

        return NextResponse.json({ success: true, data: friendLink });
    } catch (error) {
        console.error('Update friend link error:', error);
        return NextResponse.json({ success: false, error: '更新失败' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await prisma.friendLink.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete friend link error:', error);
        return NextResponse.json({ success: false, error: '删除失败' }, { status: 500 });
    }
}
