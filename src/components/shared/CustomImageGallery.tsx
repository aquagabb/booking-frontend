import React, { useRef, useState } from 'react';
import Slider from 'react-slick';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

interface CustomImageGalleryProps {
  images: string[];
  initialIndex?: number;
  onClose?: () => void;
}

const CustomImageGallery: React.FC<CustomImageGalleryProps> = ({
  images,
  initialIndex = 0,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const mainSliderRef = useRef<Slider | null>(null);
  const thumbSliderRef = useRef<Slider | null>(null);
  const hasMultipleImages = images.length > 1;

  const mainSettings = {
    arrows: hasMultipleImages,
    infinite: hasMultipleImages,
    speed: 400,
    slidesToShow: 1,
    slidesToScroll: 1,
    initialSlide: initialIndex,
    beforeChange: (_: number, next: number) => setCurrentIndex(next),
    nextArrow: hasMultipleImages ? <CustomArrow direction="right" /> : <></>,
    prevArrow: hasMultipleImages ? <CustomArrow direction="left" /> : <></>,
    afterChange: (index: number) => {
      setCurrentIndex(index);
      if (hasMultipleImages) {
        setTimeout(() => {
          thumbSliderRef.current?.slickGoTo(index);
        }, 100);
      }
    },
  };

  const thumbSettings = {
    arrows: false,
    infinite: false,
    swipeToSlide: true,
    focusOnSelect: true,
    variableWidth: true,
    centerMode: true,
    beforeChange: (_: number, next: number) => {
      if (next !== currentIndex) {
        mainSliderRef.current?.slickGoTo(next);
      }
    },
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-2">
      <div className="w-full max-w-7xl flex items-center justify-center mb-2">
        {hasMultipleImages ? (
          <Slider ref={mainSliderRef} {...mainSettings} className="w-full h-full">
            {images.map((img, i) => (
              <div
                key={i}
                className="!flex !items-center !justify-center h-[65vh] relative"
              >
                <img
                  src={img}
                  alt={`Image ${i + 1}`}
                  className="max-w-5xl max-h-[65vh] object-contain rounded-xl"
                />
              </div>
            ))}
          </Slider>
        ) : (
          <div className="w-full flex items-center justify-center h-[65vh]">
            <img
              src={images[0]}
              alt="Image 1"
              className="max-w-5xl max-h-[65vh] object-contain rounded-xl"
            />
          </div>
        )}
      </div>

      {hasMultipleImages && (
        <div className="mb-2 backdrop-blur bg-black/60 text-white text-sm px-3 py-1 rounded-full shadow">
          {currentIndex + 1} / {images.length} photos
        </div>
      )}

      {hasMultipleImages && (
        <div className="w-full max-w-7xl px-4 pb-4">
          <Slider ref={thumbSliderRef} {...thumbSettings}>
            {images.map((img, i) => (
              <div
                key={i}
                onClick={() => mainSliderRef.current?.slickGoTo(i)}
                className={`relative mx-1 cursor-pointer border-2 rounded-md transition-transform hover:scale-105 ${
                  currentIndex === i ? 'border-white' : 'border-transparent'
                }`}
                style={{ width: 80 }}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${i + 1}`}
                  className="w-full h-16 object-cover rounded-md"
                />
                <div className="absolute inset-0 bg-black/40 rounded-md" />
                {currentIndex === i && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md">
                    <Check size={18} className="text-white" />
                  </div>
                )}
              </div>
            ))}
          </Slider>
        </div>
      )}
    </div>
  );
};

const CustomArrow = ({
  direction,
  onClick,
}: {
  direction: 'left' | 'right';
  onClick?: () => void;
}) => {
  const Icon = direction === 'left' ? ChevronLeft : ChevronRight;
  return (
    <div
      onClick={onClick}
      className={`absolute top-1/2 z-40 transform -translate-y-1/2 
        ${direction === 'left' ? '-left-6 sm:-left-10' : '-right-6 sm:-right-10'}
        bg-black/60 hover:bg-black/80 text-white rounded-full shadow-lg p-3 cursor-pointer transition`}
    >
      <Icon size={32} />
    </div>
  );
};

export default CustomImageGallery;
