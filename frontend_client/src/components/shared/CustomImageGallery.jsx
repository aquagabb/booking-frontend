import { useRef, useState } from 'react';
import ReactSlick from 'react-slick';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const Slider = ReactSlick.default ?? ReactSlick;

const CustomImageGallery = ({
  images,
  initialIndex = 0,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const mainSliderRef = useRef(null);
  const thumbSliderRef = useRef(null);
  const hasMultipleImages = images.length > 1;

  const mainSettings = {
    arrows: hasMultipleImages,
    infinite: hasMultipleImages,
    speed: 400,
    slidesToShow: 1,
    slidesToScroll: 1,
    initialSlide: initialIndex,
    beforeChange: (_, next) => setCurrentIndex(next),
    nextArrow: hasMultipleImages ? <CustomArrow direction="right" /> : <></>,
    prevArrow: hasMultipleImages ? <CustomArrow direction="left" /> : <></>,
    afterChange: (index) => {
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
    beforeChange: (_, next) => {
      if (next !== currentIndex) {
        mainSliderRef.current?.slickGoTo(next);
      }
    },
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-2">
      <div className="w-full max-w-7xl flex items-center justify-center mb-2 overflow-visible">
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

const CustomArrow = ({ direction, onClick, style }) => {
  if (style?.display === 'none') return null;

  const Icon = direction === 'left' ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      aria-label={direction === 'left' ? 'Previous slide' : 'Next slide'}
      onClick={onClick}
      className={`absolute top-1/2 z-40 -translate-y-1/2
        ${direction === 'left' ? 'left-4' : 'right-4'}
        bg-black/60 hover:bg-black/80 text-white rounded-full shadow-lg p-3 cursor-pointer transition`}
    >
      <Icon size={32} />
    </button>
  );
};

export default CustomImageGallery;
