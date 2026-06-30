import React, { useMemo } from "react";
import { Check, Users } from "lucide-react";
import { ClipboardList } from "lucide-react"

const CAPACITY_TYPES = [
  "Standing",   // petreceri, cocktailuri
  "Dining",     // mese festive
  "Theater",    // conferințe
  "Boardroom",  // ședințe corporate
  "Classroom"   // traininguri (opțional)
];


const RestaurantDetailsOld = ({ restaurant }) => {
  
  const maxGuests = restaurant.capacity ? Math.max(...Object.values(restaurant.capacity)) : null;

  const randomCapacity = useMemo(() => {

    const shuffled = [...CAPACITY_TYPES].sort(() => 0.5 - Math.random());
    const subsetSize = Math.floor(Math.random() * CAPACITY_TYPES.length) + 1; // cel puțin 1
    const pickedTypes = shuffled.slice(0, subsetSize);

    return pickedTypes.reduce((acc, type) => {
      acc[type] = Math.floor(Math.random() * 100) + 20;
      return acc;
    }, {});
  }, []);

  return (
    <div className="space-y-10">

      {/* 1. About & Highlights */}
      <div className="space-y-6 border-b border-gray-200 pb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">About this place</h2>
          <p className="text-gray-700 leading-relaxed text-[15px]">{restaurant.description}</p>
        </div>

        {(restaurant.highlights?.length > 0 || maxGuests) && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
       
              {maxGuests && (
                <div className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition">
                  <Users size={18} className="text-green-600" />
                  <span className="text-sm text-gray-800">Up to {maxGuests} guests</span>
                </div>
              )}

              
              {restaurant.highlights?.slice(0, 3).map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition"
                >
                  <Check size={18} className="text-green-600" />
                  <span className="text-sm text-gray-800">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {restaurant.openingHours && (
          <div className="space-y-3">
            <h3 className="text-2xl font-semibold text-gray-900">Opening Hours</h3>
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm text-gray-700">
              {Object.entries(restaurant.openingHours).map(([day, hours]) => (
                <li key={day} className="grid grid-cols-2 gap-x-8">
                  <span className="capitalize">{day}</span>
                  <span className="font-medium text-right">{hours}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

      </div>



      {Object.keys(randomCapacity).length > 0 && (
        <div className="border-b border-gray-200 pb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Capacity</h2>

          <div className="space-y-4">
            {Object.entries(randomCapacity).map(([type, value]) => {
              const descriptions = {
                Standing: "Ideal for parties, cocktail events, or launches.",
                Dining: "Perfect for weddings or formal dining events.",
                Theater: "Great for presentations, speeches or conferences.",
                Boardroom: "Set up for business meetings with a central table.",
                Classroom: "For training sessions with rows of desks and chairs."
              };

              return (
                <div key={type} className="flex flex-col">
                  <div className="flex justify-between items-baseline">
                    <span className="text-base font-medium text-gray-900">
                      {type}
                    </span>
                    <span className="text-sm text-gray-700 font-bold">up to {value} people</span>
                  </div>
                  <p className="text-sm text-gray-500">{descriptions[type]}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}



      {restaurant.facilities?.length > 0 && (
        <div className="border-b border-gray-200 pb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Facilities</h2>

          <ul className="flex flex-wrap gap-x-6 gap-y-4 text-sm text-gray-800">
            {restaurant.facilities.map((facility) => (
              <li key={facility} className="flex items-center gap-2">
                {/* icon standard “checked” */}
                <Check size={18} className="text-green-600" />
                <span>{facility}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {restaurant.rules?.length > 0 && (
        <div className="border-b border-gray-200 pb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Space Rules</h2>
          <ul className="space-y-3">
            {restaurant.rules.map((rule) => (
              <li key={rule} className="flex items-start gap-2 text-gray-800 text-sm">
                <ClipboardList size={18} className="text-green-600 mt-1" />
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 8. Reviews */}
      {restaurant.reviews?.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Reviews</h2>
          <ul className="space-y-4">
            {restaurant.reviews.map((review, idx) => (
              <li key={idx} className="border p-3 rounded-md text-gray-700">
                <p className="font-semibold">{review.name} — ⭐ {review.rating}</p>
                <p className="text-sm italic">{new Date(review.date).toLocaleDateString()}</p>
                <p>{review.comment}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

    </div>
  );
};

export default RestaurantDetailsOld;
