import { useState } from 'react';
import ImageModal from '../components/shared/ImageModal';

const ImageGallery = ({ name = '', categories = [], images = [] }) => {
  const [showModal, setShowModal] = useState(false);

  if (!images.length) return null;

  // Show a maximum of 3 photos:
  // - 1 big on the left (~75%)
  // - 2 stacked on the right (~25%)
  const visibleImages = images.slice(0, 3);

  return (
    <div className="mb-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 md:grid-rows-2 gap-2 max-h-[560px]">
        {visibleImages[0] && (
          <img
            src={visibleImages[0]}
            alt="Image 1"
            className="w-full h-48 md:h-full object-cover rounded-sm cursor-pointer md:col-span-3 md:row-span-2"
            onClick={() => setShowModal(true)}
          />
        )}

        {visibleImages[1] && (
          <img
            src={visibleImages[1]}
            alt="Image 2"
            className="w-full h-48 md:h-full object-cover rounded-sm cursor-pointer md:col-span-1 md:row-span-1"
            onClick={() => setShowModal(true)}
          />
        )}

        {visibleImages[2] && (
          <img
            src={visibleImages[2]}
            alt="Image 3"
            className="w-full h-48 md:h-full object-cover rounded-sm cursor-pointer md:col-span-1 md:row-span-1"
            onClick={() => setShowModal(true)}
          />
        )}
      </div>

      {showModal && (
        <ImageModal name={name} categories={categories} images={images} onClose={() => setShowModal(false)} />
      )}
      </div>
    );
};

export default ImageGallery;
