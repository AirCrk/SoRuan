'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';

interface ProductGalleryProps {
    images: string[];
    name: string;
}

export default function ProductGallery({ images, name }: ProductGalleryProps) {
    const [activeImage, setActiveImage] = useState(images[0]);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const currentIndex = images.indexOf(activeImage);

    // 键盘事件处理
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isPreviewOpen) return;
            
            if (e.key === 'Escape') {
                setIsPreviewOpen(false);
            } else if (e.key === 'ArrowLeft') {
                navigateImage('prev');
            } else if (e.key === 'ArrowRight') {
                navigateImage('next');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPreviewOpen, activeImage, images]);

    // 锁定背景滚动
    useEffect(() => {
        if (isPreviewOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isPreviewOpen]);

    const navigateImage = useCallback((direction: 'prev' | 'next') => {
        const currentIdx = images.indexOf(activeImage);
        let newIndex;
        if (direction === 'prev') {
            newIndex = currentIdx > 0 ? currentIdx - 1 : images.length - 1;
        } else {
            newIndex = currentIdx < images.length - 1 ? currentIdx + 1 : 0;
        }
        setActiveImage(images[newIndex]);
    }, [activeImage, images]);

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigateImage('prev');
    };

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigateImage('next');
    };

    if (!images || images.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300 rounded-2xl">
                <span className="text-4xl font-bold">{name.charAt(0)}</span>
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-col gap-4">
                {/* 主图 */}
                <div 
                    className="group relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-gray-100 shadow-inner border border-gray-100 cursor-zoom-in"
                    onClick={() => setIsPreviewOpen(true)}
                >
                    <Image
                        src={activeImage}
                        alt={name}
                        fill
                        className="object-contain p-2 transition-all duration-300"
                        priority
                    />
                    
                    {/* 放大提示图标 */}
                    <div className="absolute top-4 right-4 bg-black/50 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <ZoomIn className="w-5 h-5" />
                    </div>
                    
                    {/* 翻页按钮 */}
                    {images.length > 1 && (
                        <>
                            <button 
                                onClick={handlePrev}
                                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/80 hover:bg-white shadow-md text-gray-700 hover:text-blue-600 transition-all opacity-0 group-hover:opacity-100"
                                aria-label="Previous image"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button 
                                onClick={handleNext}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/80 hover:bg-white shadow-md text-gray-700 hover:text-blue-600 transition-all opacity-0 group-hover:opacity-100"
                                aria-label="Next image"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </>
                    )}
                </div>

                {/* 缩略图列表 */}
                {images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {images.map((img, index) => (
                            <button
                                key={index}
                                onClick={() => setActiveImage(img)}
                                className={`relative w-24 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                                    activeImage === img 
                                        ? "border-blue-500 ring-2 ring-blue-100" 
                                        : "border-transparent hover:border-gray-300"
                                }`}
                            >
                                <Image
                                    src={img}
                                    alt={`${name} ${index + 1}`}
                                    fill
                                    className="object-cover"
                                />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* 图片预览弹窗 (LightBox) */}
            {isPreviewOpen && (
                <div 
                    className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-200"
                    onClick={() => setIsPreviewOpen(false)}
                >
                    {/* 关闭按钮 */}
                    <button 
                        onClick={() => setIsPreviewOpen(false)}
                        className="absolute top-6 right-6 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all z-50"
                    >
                        <X className="w-8 h-8" />
                    </button>

                    {/* 顶部计数 */}
                    <div className="absolute top-6 left-6 text-white/80 font-medium z-50">
                        {currentIndex + 1} / {images.length}
                    </div>

                    {/* 大图显示区域 */}
                    <div 
                        className="relative w-full h-full flex items-center justify-center p-4 md:p-12 pb-32"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="relative w-full h-full max-w-7xl max-h-[80vh]">
                            <Image
                                src={activeImage}
                                alt={name}
                                fill
                                className="object-contain"
                                priority
                                quality={100}
                            />
                        </div>

                        {/* 预览模式下的翻页按钮 */}
                        {images.length > 1 && (
                            <>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); navigateImage('prev'); }}
                                    className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md"
                                >
                                    <ChevronLeft className="w-8 h-8" />
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); navigateImage('next'); }}
                                    className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md"
                                >
                                    <ChevronRight className="w-8 h-8" />
                                </button>
                            </>
                        )}
                    </div>

                    {/* 底部缩略图栏 */}
                    {images.length > 1 && (
                        <div 
                            className="absolute bottom-8 left-0 right-0 flex justify-center gap-3 px-4 overflow-x-auto py-2"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {images.map((img, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveImage(img)}
                                    className={`relative w-20 h-14 flex-shrink-0 rounded-md overflow-hidden transition-all border-2 ${
                                        activeImage === img 
                                            ? "border-blue-500 scale-110 shadow-lg shadow-black/50" 
                                            : "border-transparent opacity-60 hover:opacity-100 hover:border-white/50"
                                    }`}
                                >
                                    <Image
                                        src={img}
                                        alt={`${name} ${index + 1}`}
                                        fill
                                        className="object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
