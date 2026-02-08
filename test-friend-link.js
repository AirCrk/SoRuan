require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

async function main() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error('Error: DATABASE_URL not found in environment');
        process.exit(1);
    }

    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    try {
        console.log('正在尝试连接数据库...');

        // 尝试查询现有链接
        const count = await prisma.friendLink.count();
        console.log(`当前友情链接数量: ${count}`);

        // 尝试创建一个测试链接
        console.log('正在尝试创建测试链接...');
        const link = await prisma.friendLink.create({
            data: {
                name: 'Test Link ' + Date.now(),
                url: 'https://example.com',
                sortOrder: 999,
                isActive: false
            }
        });

        console.log('创建成功:', link);

        // 清理
        await prisma.friendLink.delete({
            where: { id: link.id }
        });
        console.log('测试链接已清理');

    } catch (e) {
        console.error('测试失败:', e);
        // 打印更详细的错误
        if (e.code) console.error('Error code:', e.code);
        if (e.meta) console.error('Error meta:', e.meta);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

main();
