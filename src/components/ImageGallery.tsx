import { useState } from 'react';
import { PlayCircle, Image as ImageIcon, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ImageGalleryProps {
  mainImage: string;
  galleryImagesRaw?: string;
  virtualTourUrl?: string;
}

export default function ImageGallery({ mainImage, galleryImagesRaw, virtualTourUrl }: ImageGalleryProps) {
  const [showVirtualTour, setShowVirtualTour] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  let gallery: string[] = [];
  try {
    if (galleryImagesRaw) {
      gallery = JSON.parse(galleryImagesRaw);
    }
  } catch (e) {
    // Ignore invalid JSON
  }

  // Combine main image and gallery images for the lightbox
  const allImages = [mainImage, ...gallery.filter(img => img !== mainImage)];

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = 'auto';
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  if (showVirtualTour && virtualTourUrl) {
    return (
      <div className="w-full h-[400px] md:h-[500px] relative bg-gray-900 border-b border-gray-200">
        <iframe 
          src={virtualTourUrl} 
          className="w-full h-full absolute inset-0 z-10 border-0"
          allowFullScreen
        ></iframe>
        <button 
          onClick={() => setShowVirtualTour(false)}
          className="absolute top-4 right-4 z-20 bg-white/20 backdrop-blur-md hover:bg-white/40 text-white p-2 rounded-full transition"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="w-full h-[400px] md:h-[500px] relative bg-gray-900">
        {gallery.length >= 2 ? (
          <div className="w-full h-full grid grid-cols-1 md:grid-cols-3 gap-2 p-2">
            <div className="md:col-span-2 h-full relative cursor-pointer group rounded-l-xl overflow-hidden" onClick={() => openLightbox(0)}>
              <img src={allImages[0]} alt="Principal" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition duration-500 group-hover:scale-105" />
            </div>
            <div className="hidden md:grid grid-rows-2 gap-2 h-full relative">
               <div className="h-full relative cursor-pointer group rounded-tr-xl overflow-hidden" onClick={() => openLightbox(1)}>
                  <img src={allImages[1]} alt="Galeria 1" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition duration-500 group-hover:scale-105" />
               </div>
               <div className="h-full relative cursor-pointer group rounded-br-xl overflow-hidden" onClick={() => openLightbox(2)}>
                  <img src={allImages[2] || allImages[1]} alt="Galeria 2" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition duration-500 group-hover:scale-105" />
                  
                  {allImages.length > 3 && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition">
                      <span className="text-white font-medium text-lg flex items-center gap-2">
                        <ImageIcon className="w-5 h-5" />
                        +{allImages.length - 3} fotos
                      </span>
                    </div>
                  )}
               </div>
            </div>
          </div>
        ) : (
          <img 
            src={mainImage} 
            alt="Imóvel"
            className="w-full h-full object-cover opacity-80 cursor-pointer"
            onClick={() => openLightbox(0)}
          />
        )}
        
        {/* Virtual Tour Button Floating */}
        {virtualTourUrl && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <button 
              onClick={(e) => { e.stopPropagation(); setShowVirtualTour(true); }}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-full p-4 md:p-6 transition flex flex-col items-center gap-2 group pointer-events-auto"
            >
              <PlayCircle className="w-12 h-12 md:w-16 md:h-16 shadow-lg group-hover:scale-110 transition-transform" />
              <span className="font-semibold uppercase tracking-widest text-sm text-shadow">Tour Virtual</span>
            </button>
          </div>
        )}

        {/* View All Photos Mobile Button */}
        {allImages.length > 1 && (
          <div className="absolute bottom-24 left-4 md:bottom-4 md:right-4 md:left-auto z-10">
            <button 
              onClick={() => openLightbox(0)} 
              className="bg-white/90 backdrop-blur text-gray-900 font-medium px-4 py-2 rounded-lg shadow-sm hover:bg-white transition flex items-center gap-2 text-sm"
            >
              <ImageIcon className="w-4 h-4" />
              Ver {allImages.length} fotos
            </button>
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center"
          >
            <button 
              className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full transition z-50"
              onClick={closeLightbox}
            >
              <X className="w-8 h-8" />
            </button>

            {allImages.length > 1 && (
              <>
                <button 
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-2 hover:bg-white/10 rounded-full transition z-50"
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                >
                  <ChevronLeft className="w-10 h-10" />
                </button>
                <button 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-2 hover:bg-white/10 rounded-full transition z-50"
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                >
                  <ChevronRight className="w-10 h-10" />
                </button>
              </>
            )}

            <div className="relative w-full h-full flex items-center justify-center p-4 md:p-12" onClick={closeLightbox}>
              <motion.img 
                key={currentImageIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                src={allImages[currentImageIndex]} 
                className="max-w-full max-h-full object-contain shadow-2xl"
                alt={`Imagem ${currentImageIndex + 1}`}
                onClick={(e) => e.stopPropagation()} // Prevent click from closing lightbox
              />
              
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium tracking-widest bg-black/50 px-4 py-2 rounded-full">
                {currentImageIndex + 1} / {allImages.length}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
