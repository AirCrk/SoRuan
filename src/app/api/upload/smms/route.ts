import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST - Upload to SM.MS
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        
        if (!file) {
            return NextResponse.json({ success: false, error: '请上传文件' }, { status: 400 });
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ success: false, error: '不支持的文件类型' }, { status: 400 });
        }

        // Validate file size (SM.MS limit is usually 5MB for free users)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ success: false, error: '文件大小不能超过 5MB' }, { status: 400 });
        }

        // 优先从数据库读取配置
        const smmsConfig = await prisma.siteConfig.findUnique({
            where: { key: 'smms_token' }
        });
        
        const token = smmsConfig?.value || process.env.SMMS_TOKEN;

        if (!token) {
            return NextResponse.json({ success: false, error: '服务器未配置 SM.MS Token' }, { status: 500 });
        }

        // Create a new FormData for the upstream request
        const upstreamFormData = new FormData();
        upstreamFormData.append('smfile', file);
        upstreamFormData.append('format', 'json');

        const response = await fetch('https://sm.ms/api/v2/upload', {
            method: 'POST',
            headers: {
                'Authorization': token,
                // Note: Do NOT set Content-Type header manually for FormData, 
                // fetch will generate it with the correct boundary.
                'User-Agent': 'BuySoft/1.0'
            },
            body: upstreamFormData,
        });

        const data = await response.json();

        if (data.success) {
            // 保存到本地数据库，标记为本站上传
            try {
                await prisma.uploadedImage.create({
                    data: {
                        url: data.data.url,
                        filename: data.data.filename || file.name,
                        width: data.data.width ? parseInt(String(data.data.width)) : null,
                        height: data.data.height ? parseInt(String(data.data.height)) : null,
                        size: data.data.size ? parseInt(String(data.data.size)) : null,
                        hash: data.data.hash,
                        deleteUrl: data.data.delete
                    }
                });
            } catch (dbError) {
                console.error('保存上传记录到数据库失败:', dbError);
                // 即使保存数据库失败，也不应该阻断上传流程，因为图片已经上传成功
            }

            return NextResponse.json({ 
                success: true, 
                url: data.data.url,
                delete: data.data.delete // Optional: return delete link if needed
            });
        } else if (data.code === 'image_repeated') {
            // SM.MS returns this code if image already exists
            const url = data.images || (typeof data.data === 'string' ? data.data : data.data?.url);

            // 如果是重复图片，也尝试记录到本地（如果本地没有的话），以便在历史记录中显示
            if (url) {
                try {
                    const existing = await prisma.uploadedImage.findFirst({ where: { url } });
                    if (!existing) {
                        await prisma.uploadedImage.create({
                            data: {
                                url: url,
                                filename: file.name, // 使用本次上传的文件名作为记录
                            }
                        });
                    }
                } catch (e) {
                    console.error('保存重复图片记录失败:', e);
                }
            }

            return NextResponse.json({ 
                success: true, 
                url: url
            });
        } else {
            return NextResponse.json({ success: false, error: data.message || 'SM.MS 上传失败' }, { status: 400 });
        }

    } catch (error) {
        console.error('SM.MS 上传失败:', error);
        return NextResponse.json({ success: false, error: '上传失败' }, { status: 500 });
    }
}
