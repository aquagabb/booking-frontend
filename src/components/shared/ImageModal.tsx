import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import CustomImageGallery from './CustomImageGallery';
import { ArrowLeft, X } from 'lucide-react';

interface Category {
  name: string;
  images: string[];
}

type CategoryType = string | Category;

interface ImageModalProps {
  name?: string;
  categories?: CategoryType[];
  images?: string[];
  onClose?: () => void;
}

const ImageModal = ({ name = '', categories = [], images = [], onClose }: ImageModalProps) => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const [sliderOpen, setSliderOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeSection, setActiveSection] = useState(0);




  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);

  const openSlider = (index: number) => {
    setCurrentIndex(index);
    setSliderOpen(true);
  };

  const allImages = images;

  useEffect(() => {
    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = sectionRefs.current.findIndex((ref) => ref === entry.target);
            if (index !== -1) {
              setActiveSection(index);
            }
          }
        });
      },
      { root: null, threshold: 0.5 }
    );

    sectionRefs.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose?.();
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
    >
      <div
        ref={modalRef}
        className="relative bg-white rounded-xl w-[90vw] h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="relative py-4 border-b border-black/10 flex items-center justify-between px-4">
          {sliderOpen && (
            <button
              onClick={() => setSliderOpen(false)}
              className="text-black hover:opacity-70 z-10 flex items-center gap-2"
            >
              <ArrowLeft className="w-6 h-6" />
              <span>Back to gallery - {name}</span>
            </button>
          )}
          {!sliderOpen && (
            <button className='text-black z-10 flex items-center gap-2 pl-0'>
              {name}
            </button>
          )}


          <div className="flex-1 flex items-center gap-1">
            {!sliderOpen && (
              <button 
                className="btn-primary" 
                onClick={() => {
                  if (slug) {
                    const params = new URLSearchParams(searchParams);
                    params.set('step', '1');
                    const queryString = params.toString();
                    navigate(`/checkout/${slug}${queryString ? `?${queryString}` : ''}`);
                  }
                }}
              >
                Reserve now
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 z-10">
            <button
              onClick={onClose}
              className="text-black hover:opacity-70 flex items-center gap-1"
            >
              <span>Close</span>
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* SLIDER VIEW */}
        {sliderOpen ? (
          <div className="flex-1 overflow-hidden">
            <CustomImageGallery
              images={allImages}
              initialIndex={currentIndex}
              onClose={() => setSliderOpen(false)}
            />
          </div>
        ) : (
          <>
            {/* Categories Nav */}
            <div className="px-4 py-3 overflow-x-auto">
              <div className="flex gap-4">
                {categories.map((cat, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      sectionRefs.current[idx]?.scrollIntoView({ behavior: 'smooth' });
                      setActiveSection(idx);
                    }}
                    className={`flex flex-col items-center w-24 shrink-0 transition-opacity duration-300 ${activeSection === idx ? 'opacity-100' : 'opacity-50'
                      }`}
                  >
                    <div className="w-24 h-16 rounded-md overflow-hidden border">
                      <img
                        src={typeof cat === 'object' ? cat.images?.[0] : images[0] || ''}
                        alt={typeof cat === 'object' ? cat.name : cat}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-sm mt-1 text-black font-medium text-center">
                      {typeof cat === 'object' ? cat.name : cat}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Photo Grid */}
            <div className="flex-1 overflow-y-auto p-4 space-y-10">
              {categories.map((category, catIndex) => (
                <div key={catIndex} ref={(el) => { sectionRefs.current[catIndex] = el; }}>
                  <h3 className="text-black text-base font-semibold mb-4">
                    {typeof category === 'object' ? category.name : category}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {((typeof category === 'object' ? category.images : []) || []).map((img: string, index: number) => {
                      const flatIndex = categories
                        .slice(0, catIndex)
                        .reduce((acc, c) => acc + (typeof c === 'object' ? (c.images?.length || 0) : 0), 0) + index;

                      return (
                        <div
                          key={index}
                          className="aspect-[4/3] cursor-pointer overflow-hidden rounded-lg"
                          onClick={() => openSlider(flatIndex)}
                        >
                          <img
                            src={img}
                            alt={`Image ${index + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ImageModal;
