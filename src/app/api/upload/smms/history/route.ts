import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET - 获取本地记录的 SM.MS 上传历史（只显示本站上传的图片）
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const keyword = searchParams.get('keyword') || '';

        // 构建查询条件
        const where: any = {};
        if (keyword) {
            where.filename = {
                contains: keyword,
                mode: 'insensitive', // 不区分大小写
            };
        }

        // 查询总数
        const total = await prisma.uploadedImage.count({ where });

        // 计算总页数
        const totalPages = Math.ceil(total / limit);

        // 分页查询
        const images = await prisma.uploadedImage.findMany({
            where,
            orderBy: {
                createdAt: 'desc',
            },
            skip: (page - 1) * limit,
            take: limit,
        });

        // 格式化返回数据，保持与前端兼容
        const data = images.map(img => ({
            url: img.url,
            filename: img.filename,
            // 格式化日期为 YYYY-MM-DD HH:mm:ss 格式，或者直接返回 ISO 字符串
            // 这里简单返回 ISO 字符串，前端展示可能需要调整，或者后端格式化
            created_at: img.createdAt.toISOString(), 
        }));

        return NextResponse.json({ 
            success: true, 
            data: data,
            pagination: {
                total,
                page,
                limit,
                totalPages: totalPages || 0
            }
        });

    } catch (error) {
        console.error('获取历史记录失败:', error);
        return NextResponse.json({ success: false, error: '获取历史记录失败' }, { status: 500 });
    }
}
