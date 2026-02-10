import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/prisma';
import { Flame } from 'lucide-react';

export default async function HotProducts() {
  const hotProducts = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { clickCount: 'desc' },
    take: 10,
    select: {
      id: true,
      name: true,
      slug: true,
      logo: true,
      coverImage: true,
      salePrice: true,
      subtitle: true,
    }
  });

  if (hotProducts.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
      <div className="p-4 border-b border-gray-100 flex items-center gap-2">
        <Flame className="w-5 h-5 text-red-500 fill-red-500" />
        <h3 className="font-bold text-gray-900">热门软件</h3>
      </div>
      
      <div className="divide-y divide-gray-100">
        {hotProducts.map((product, index) => (
          <Link 
            key={product.id}
            href={`/soft/${product.slug || product.id}`}
            className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors group"
          >
            <div className="relative flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-100 border border-gray-100">
               {/* Rank Badge */}
               {index < 3 && (
                 <div className={`absolute top-0 left-0 w-5 h-5 flex items-center justify-center text-[10px] font-bold text-white z-10 rounded-br-lg ${
                    index === 0 ? 'bg-red-500' : index === 1 ? 'bg-orange-500' : 'bg-yellow-500'
                 }`}>
                   {index + 1}
                 </div>
               )}

              {(product.logo || product.coverImage) ? (
                <Image
                  src={product.logo || product.coverImage || ''}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-500 font-bold">
                  {product.name.charAt(0)}
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 text-sm line-clamp-1 group-hover:text-blue-600">
                {product.name}
              </h4>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-gray-500 line-clamp-1 flex-1 mr-2">
                    {product.subtitle || '暂无简介'}
                </span>
                <span className="text-red-600 font-bold text-sm">¥{Number(product.salePrice).toFixed(0)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
