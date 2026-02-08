import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { createHmac } from 'crypto';

function verify(text: string, signature: string, secret: string) {
    const expected = createHmac('sha256', secret).update(text).digest('hex');
    return expected === signature;
}

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: '邮箱', type: 'email' },
                password: { label: '密码', type: 'password' },
                captcha: { label: '验证码', type: 'text' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password || !credentials?.captcha) {
                    throw new Error('请输入邮箱、密码和验证码');
                }

                // 1. 校验验证码
                const cookieStore = await cookies();
                const captchaCookie = cookieStore.get('auth-captcha');
                if (!captchaCookie) {
                    throw new Error('验证码已过期，请刷新');
                }

                const [text, signature] = captchaCookie.value.split('.');
                const secret = process.env.NEXTAUTH_SECRET || 'default-secret-key';

                if (!verify(text, signature, secret)) {
                    throw new Error('验证码无效');
                }

                if (text !== credentials.captcha.toLowerCase()) {
                    throw new Error('验证码错误');
                }

                // 2. 查询用户
                const user = await prisma.adminUser.findUnique({
                    where: { email: credentials.email },
                });

                if (!user) {
                    // 为了安全，不提示用户不存在，统一提示账号或密码错误
                    // 但这里为了方便演示，可以抛出特定错误，或者统一错误
                    // 也可以记录不存在账号的尝试
                    throw new Error('账号或密码错误');
                }

                // 3. 检查账户锁定状态
                if (user.lockoutUntil && user.lockoutUntil > new Date()) {
                    const waitMinutes = Math.ceil((user.lockoutUntil.getTime() - Date.now()) / 1000 / 60);
                    throw new Error(`账户已锁定，请能在 ${waitMinutes} 分钟后重试`);
                }

                // 4. 校验密码
                const isValid = await bcrypt.compare(credentials.password, user.password);

                if (!isValid) {
                    // 更新失败次数
                    const now = new Date();
                    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

                    let newAttempts = user.loginAttempts + 1;
                    let newLockoutUntil = user.lockoutUntil;

                    // 如果距离上次尝试超过5分钟，重置计数（但这里逻辑稍微复杂，
                    // 简单的策略是：只要最后一次尝试在5分钟前，就重置为1）
                    if (user.lastAttemptTime && user.lastAttemptTime < fiveMinutesAgo) {
                        newAttempts = 1;
                    }

                    // 检查是否触发锁定（第5次失败）
                    if (newAttempts >= 5) {
                        newLockoutUntil = new Date(now.getTime() + 60 * 60 * 1000); // 锁定1小时
                    }

                    await prisma.adminUser.update({
                        where: { id: user.id },
                        data: {
                            loginAttempts: newAttempts,
                            lastAttemptTime: now,
                            lockoutUntil: newLockoutUntil,
                        },
                    });

                    if (newAttempts >= 5) {
                        throw new Error('密码错误次数过多，账户已锁定1小时');
                    } else {
                        throw new Error(`密码错误，还剩 ${5 - newAttempts} 次尝试机会`);
                    }
                }

                // 5. 登录成功，重置计数
                await prisma.adminUser.update({
                    where: { id: user.id },
                    data: {
                        loginAttempts: 0,
                        lastAttemptTime: null,
                        lockoutUntil: null,
                    },
                });

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                };
            },
        }),
    ],
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    pages: {
        signIn: '/admin/login',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id;
            }
            return session;
        },
    },
};
