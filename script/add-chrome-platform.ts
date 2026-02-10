
import prisma from '../src/lib/prisma';

async function main() {
  try {
    // Check if Chrome Extension platform exists
    const existing = await prisma.platform.findFirst({
      where: { name: 'Chrome 扩展' }
    });

    if (!existing) {
      console.log('Adding "Chrome 扩展" platform...');
      await prisma.platform.create({
        data: {
          name: 'Chrome 扩展',
        }
      });
      console.log('Added "Chrome 扩展".');
    } else {
      console.log('"Chrome 扩展" already exists.');
    }

    // Check if MacOS platform exists or needs renaming
    // The user said "Mac的分类名改为MacOS".
    // Let's check if there is a platform named "Mac"
    const macPlatform = await prisma.platform.findFirst({
        where: { name: 'Mac' }
    });

    if (macPlatform) {
        console.log('Renaming "Mac" to "macOS"...');
        await prisma.platform.update({
            where: { id: macPlatform.id },
            data: { name: 'macOS' }
        });
        console.log('Renamed "Mac" to "macOS".');
    } else {
        // Check if "macOS" already exists
        const macOsPlatform = await prisma.platform.findFirst({
            where: { name: 'macOS' }
        });
        if (!macOsPlatform) {
             console.log('Creating "macOS" platform...');
             await prisma.platform.create({
                data: {
                    name: 'macOS',
                }
             });
        } else {
            console.log('"macOS" already exists.');
        }
    }

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
