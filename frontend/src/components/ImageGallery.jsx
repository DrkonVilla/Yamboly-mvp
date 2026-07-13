import { useState } from 'react';

export const ImageGallery = ({ sku, nombre }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  const images = Array.from({ length: 4 }, (_, i) => ({
    url: `https://picsum.photos/seed/${sku}-${i + 1}/500/500`,
    thumb: `https://picsum.photos/seed/${sku}-${i + 1}/60/60`,
    alt: `${nombre} - vista ${i + 1}`,
  }));

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative w-full max-w-[500px] overflow-hidden rounded-lg cursor-crosshair"
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
      >
        <img
          src={images[activeIndex].url}
          alt={images[activeIndex].alt}
          className={`w-full h-auto transition-opacity duration-300 ${
            zoomed ? 'scale-115' : 'scale-100'
          }`}
          style={{ transition: 'transform 0.3s ease, opacity 0.3s ease' }}
        />
      </div>
      <div className="flex gap-2">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={`w-14 h-14 rounded-md overflow-hidden border-2 transition-colors ${
              i === activeIndex ? 'border-yamboly-cyan' : 'border-transparent'
            }`}
          >
            <img src={img.thumb} alt={img.alt} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
};
