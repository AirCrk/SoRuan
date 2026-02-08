import { NextResponse } from 'next/server';
import svgCaptcha from 'svg-captcha';
import { createHmac } from 'crypto';

export const dynamic = 'force-dynamic';

function sign(text: string, secret: string) {
    return createHmac('sha256', secret).update(text).digest('hex');
}

export async function GET() {
    const captcha = svgCaptcha.create({
        size: 4, // 验证码长度
        ignoreChars: '0o1i', // 排除易混淆字符
        noise: 2, // 干扰线数量
        color: true,
        background: '#f0f0f0',
        width: 100,
        height: 40,
    });

    const secret = process.env.NEXTAUTH_SECRET || 'default-secret-key';
    const signature = sign(captcha.text.toLowerCase(), secret);
    const cookieValue = `${captcha.text.toLowerCase()}.${signature}`;

    const headers = new Headers();
    headers.set('Content-Type', 'image/svg+xml');
    headers.set('Set-Cookie', `auth-captcha=${cookieValue}; Path=/; HttpOnly; SameSite=Strict; Max-Age=300`); // 5分钟有效

    return new NextResponse(captcha.data, {
        status: 200,
        headers,
    });
}
