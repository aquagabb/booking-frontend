import { useState } from 'react';
import ReactSlick from 'react-slick';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const Slider = ReactSlick.default ?? ReactSlick;

const CustomImageSlider = ({
  images,
  onClose,
  initialIndex = 0,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const sliderSettings = {
    arrows: true,
    infinite: true,
    speed: 400,
    slidesToShow: 1,
    slidesToScroll: 1,
    initialSlide: initialIndex,
    beforeChange: (_, next) => setCurrentIndex(next),
    nextArrow: <CustomArrow direction="right" />,
    prevArrow: <CustomArrow direction="left" />,
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col p-4">
      <button
        onClick={onClose}
        className="absolute top-5 right-5 text-white text-3xl font-bold z-50"
        aria-label="Close modal"
      >
        <X size={32} />
      </button>

      <div className="absolute top-5 left-1/2 transform -translate-x-1/2 z-50 text-sm text-black font-medium bg-white/70 px-3 py-1 rounded-full shadow">
        {currentIndex + 1} / {images.length} photos
      </div>

      <div className="w-full h-full max-w-screen-2xl mx-auto px-4">
        <Slider {...sliderSettings}>
          {images.map((img, i) => (
            <div key={i} className="w-full h-screen flex items-center justify-center">
              <img
                src={img}
                alt={`Image ${i + 1}`}
                className="max-w-full h-full object-contain mx-auto rounded-xl"
              />
            </div>
          ))}
        </Slider>
      </div>
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
        bg-white rounded-full shadow p-2 cursor-pointer opacity-90 hover:opacity-100`}
    >
      <Icon size={24} className="text-black" />
    </button>
  );
};

export default CustomImageSlider;
