
import prisma from '../src/lib/prisma';

async function main() {
  try {
    // Update macOS icon to 'macos' (maps to AppWindow)
    await prisma.platform.update({
      where: { name: 'macOS' },
      data: { icon: 'macos' },
    });
    console.log('Updated macOS icon to macos');

    // Update Chrome 扩展 icon to 'chrome'
    await prisma.platform.update({
      where: { name: 'Chrome 扩展' },
      data: { icon: 'chrome' },
    });
    console.log('Updated Chrome 扩展 icon to chrome');

    // Update Web icon to 'web'
    await prisma.platform.update({
      where: { name: 'Web' },
      data: { icon: 'web' },
    });
    console.log('Updated Web icon to web');

    // Update iOS icon to 'ios' (for consistency, though 'apple' also works)
    await prisma.platform.update({
      where: { name: 'iOS' },
      data: { icon: 'ios' },
    });
    console.log('Updated iOS icon to ios');

  } catch (e) {
    console.error('Error updating platform icons:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
