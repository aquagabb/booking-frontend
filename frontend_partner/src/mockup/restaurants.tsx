const RESTAURANTS = [
  {
    id: 11,
    name: "Jack's Pub",
    slug: "jacks-pub",
    cuisine: "Traditional Romanian",
    location: "Old Town, Bucharest",
    avgPrice: 45,
    priceCategory: "$$",
    rating: 4.6,
    reviewsCount: 9,
    highlights: ["Skybar"],
    facilities: ["Private Dining", "Live Music"],
    images: [
      "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80",
      "https://images.unsplash.com/photo-1598514982800-2404e0b7e170?w=800&q=80",
      "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed33?w=800&q=80"
    ]
  },
  {
    id: 12,
    name: "Hanul Dacilor",
    slug: "hanul-dacilor",
    cuisine: "Eastern European",
    location: "Cluj Center",
    avgPrice: 45,
    priceCategory: "$$",
    rating: 4.7,
    reviewsCount: 3,
    highlights: ["Garden Seating"],
    facilities: ["Wine Bar", "Valet Parking"],
    images: [
      "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800&q=80",
      "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=800&q=80"
    ]
  },
  {
    id: 13,
    name: "La Ceaun",
    slug: "la-ceaun",
    cuisine: "Rustic Cuisine",
    location: "Piata Mare, Sibiu",
    avgPrice: 55,
    priceCategory: "$$$",
    rating: 4.3,
    reviewsCount: 11,
    highlights: ["Rooftop"],
    facilities: ["Skybar", "Skypool"],
    images: [
      "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=800&q=80",
      "https://images.unsplash.com/photo-1613145998990-5c8eb4f12532?w=800&q=80",
      "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=800&q=80"
    ]
  },
  {
    id: 14,
    name: "Biergarten Bliss",
    slug: "biergarten-bliss",
    cuisine: "German • Bavarian",
    location: "Mitte, Berlin",
    avgPrice: 65,
    priceCategory: "$$$",
    rating: 4.5,
    reviewsCount: 25,
    highlights: ["Bar / Lounge"],
    facilities: ["Bar/Lounge", "Fine Dining"],
    images: [
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
      "https://images.unsplash.com/photo-1572569511228-8db1f0d97253?w=800&q=80"
    ]
  },
  {
    id: 15,
    name: "Schnitzelhaus",
    slug: "schnitzelhaus",
    cuisine: "Traditional German",
    location: "Altstadt, Munich",
    avgPrice: 35,
    priceCategory: "$$",
    rating: 4.8,
    reviewsCount: 300,
    highlights: ["Rooftop"],
    facilities: ["Outdoor Seating", "Family Friendly"],
    images: [
      "https://www.ahstatic.com/photos/1312_rsr001_02_p_2048x1536.jpg",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
      "https://images.unsplash.com/photo-1598514982800-2404e0b7e170?w=800&q=80"
    ]
  },
  {
    id: 16,
    name: "Kaiser Hof",
    slug: "kaiser-hof",
    cuisine: "European • Grill",
    location: "Innenstadt, Frankfurt",
    avgPrice: 45,
    priceCategory: "$$",
    rating: 4.7,
    reviewsCount: 150,
    highlights: ["Fine Dining"],
    facilities: ["Wine Bar", "Valet Parking"],
    images: [
      "https://www.settimoristorante.it/wp-content/uploads/sites/106/2020/01/slide_home_sofitel_settimo_ristorante_terrazza-800x436.jpg",
      "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80",
      "https://images.unsplash.com/photo-1598514982800-2404e0b7e170?w=800&q=80"
    ]
  },
  {
    id: 17,
    name: "The Vault Bar at The Marmorosch ",
    slug: "the-vault-bar",
    cuisine: "Spanish • Tapas",
    location: "Gothic Quarter, Barcelona",
    avgPrice: 35,
    priceCategory: "$$",
    rating: 4.4,
    reviewsCount: 200,
    highlights: ["Inside Dining"],
    facilities: ["Outdoor Seating", "Live Music"],
    images: [
      "https://i.scdn.co/image/ab6765630000ba8a63869ac6e201cbf6645c8fb1"
    ]
  },
  {
    id: 18,
    name: "Casa Flamenca",
    slug: "casa-flamenca",
    cuisine: "Andalusian Cuisine",
    location: "Centro, Madrid",
    avgPrice: 50,
    priceCategory: "$$$",
    rating: 4.6,
    reviewsCount: 120,
    highlights: ["Bar / Lounge"],
    facilities: ["Bar/Lounge", "Family Friendly"],
    images: [
      "https://terracerestaurantandlounge.com/wp-content/uploads/burbank-terrace-01.jpg",
      "https://terracerestaurantandlounge.com/wp-content/uploads/burbank-terrace-01.jpg",
    ]
  },
  {
    id: 19,
    name: "Sol y Sombra",
    slug: "sol-y-sombra",
    cuisine: "Mediterranean • Seafood",
    location: "Old Town, Seville",
    avgPrice: 55,
    priceCategory: "$$$",
    rating: 4.7,
    reviewsCount: 75,
    highlights: ["Rooftop"],
    facilities: ["Fine Dining", "Private Dining"],
    images: [
      "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80",
      "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=800&q=80",
      "https://images.unsplash.com/photo-1613145998990-5c8eb4f12532?w=800&q=80"
    ]
  }
];

const restaurantData = {
  "id": 12,
  "name": "Hanul Dacilor",
  "slug": "hanul-dacilor",
  "description": "A traditional Eastern European venue offering authentic Romanian dishes in a rustic setting. Perfect for private dining, corporate events, or celebrations.",
  "cuisine": "Eastern European",
  "location": "Cluj Center",
  "address": "Strada Eroilor 25, Cluj-Napoca, Romania",
  "coordinates": {
    "lat": 46.770439,
    "lng": 23.591423
  },
  "avgPrice": 45,
  "priceCategory": "$$",
  "rating": 4.7,
  "reviewsCount": 3,
  "highlights": ["Garden Seating", "Live Music", "Private Rooms"],
  "facilities": ["Air Conditioning", "Private Parking", "WiFi", "Accessible Entrance"],
  "capacity": {
    "dining": 60,
    "standing": 100,
    "meeting": 25
  },
  "avEquipment": { "soundSystem": true, "projector": true, "screen": true },
  "eventTypes": [
    "Meetings",
    "Private Dining",
    "Corporate Events",
    "Birthday Parties",
    "Weddings"
  ],
  "openingHours": {
    "monday": "11:00 - 23:00",
    "tuesday": "11:00 - 23:00",
    "wednesday": "11:00 - 23:00",
    "thursday": "11:00 - 23:00",
    "friday": "11:00 - 01:00",
    "saturday": "12:00 - 01:00",
    "sunday": "12:00 - 22:00"
  },
  "contact": {
    "phone": "+40 264 123 456",
    "email": "contact@hanuldacilor.ro",
    "website": "https://www.hanuldacilor.ro"
  },
  "accessibility": {
    "wheelchairAccessible": true,
    "hearingLoop": false,
    "elevator": true
  },
  "rules": ["No smoking indoors", "Outside drinks not allowed"],
  "bookingOptions": {
    "requiresDeposit": true,
    "depositAmount": 500,
    "cancellationPolicy": "Free cancellation up to 48 hours before event",
    "minBookingHours": 2,
    "bookingAdvanceNotice": "24 hours"
  },
  reviews: [
    {
      id: 1,
      user: {
        name: "Andrei Popescu",
        avatarUrl: "https://i.pravatar.cc/150?img=1"
      },
      rating: 5,
      comment: "Incredible atmosphere and amazing food. We hosted our wedding here and everything was perfect – from the staff to the music and menu. Highly recommend!",
      date: "2025-06-30T15:42:00Z"
    },
    {
      id: 2,
      user: {
        name: "Elena Ionescu",
        avatarUrl: "https://i.pravatar.cc/150?img=5"
      },
      rating: 4,
      comment: "The venue is beautiful and the garden seating was perfect for our summer party. Some dishes could have been served warmer, but overall a great experience.",
      date: "2025-06-25T12:10:00Z"
    },
    {
      id: 3,
      user: {
        name: "David Müller",
        avatarUrl: "https://i.pravatar.cc/150?img=8"
      },
      rating: 4.5,
      comment: "Authentic Eastern European cuisine and very professional staff. We organized a corporate dinner for 40 people and everything went smoothly.",
      date: "2025-06-15T09:30:00Z"
    }
  ],
  menu: {
    description: "Our wedding menu includes traditional Romanian courses with flexible vegetarian options.",
    categories: [
      {
        title: "Starters",
        items: ["Cheese platter", "Cold cuts", "Salads"]
      },
      {
        title: "Main Courses",
        items: ["Sarmale with polenta", "Grilled chicken with vegetables", "Beef stew with potatoes"]
      },
      {
        title: "Desserts",
        items: ["Papanasi with jam", "Mini cakes platter"]
      },
      {
        title: "Drinks",
        items: ["House wine", "Soft drinks", "Sparkling water", "Espresso"]
      }
    ],
    downloadableMenuUrl: "https://example.com/menu-wedding.pdf"
  }
  ,
  'main_image': 'https://offloadmedia.feverup.com/secretsanfrancisco.com/wp-content/uploads/2021/09/31120752/kaiyo-rooftop.jpg',
  "categories_images": [
    {
      title: "Gallery",
      images: [
        "https://www.anuala.ro/proiecte/2024/221/thumb.jpg",
        "https://panoramicrestaurant.com/wp-content/uploads/2023/07/2TH08812-1-scaled.jpg",
        "https://images.wsj.net/im-65599456?size=1.5",
        "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80",
        "https://assets.architecturaldigest.in/photos/6385cf3311f0276636badfb6/16:9/w_1280,c_limit/DSC_8367-Edit-W.png",
        "https://offloadmedia.feverup.com/secretsanfrancisco.com/wp-content/uploads/2021/09/31120752/kaiyo-rooftop.jpg"
      ],
    },
    {
      title: "Menu",
      images: [
        "https://pizzaroni.ro/wp-content/uploads/2023/09/0FL_8957-scaled.webp",
        "https://www.restauranttinecz.ro/image/cache/catalog/product-161-870x580.jpg",
        "https://restaurantprovence.ro/wp-content/uploads/2022/09/Somon-la-gratar.jpg",
        "https://mlewe8ipggt2.i.optimole.com/w:1170/h:600/q:mauto/rt:fill/g:ce/f:best/ig:avif/https://www.signaturebride.net/wp-content/uploads/2020/05/Featured-Image.jpeg",
        "https://www.shaadidukaan.com/vogue/wp-content/uploads/2020/04/Summer-Wedding-Food-Ideas-yahire.jpg"
      ],
    },
    {
      title: "Outdoor",
      images: [
        "https://platform.la.eater.com/wp-content/uploads/sites/26/chorus/uploads/chorus_asset/file/24739543/GARDEN.jpg?quality=90&strip=all&crop=0,1.5111111111111,100,96.977777777778",
        "https://blog.etundra.com/wp-content/Media/2021/05/WP-Hero-Image.jpg",
        "https://cdn.vox-cdn.com/thumbor/eJXkb_rC6N8Ljun3_Twpi8Kipog=/1400x1400/filters:format(jpeg)/cdn.vox-cdn.com/uploads/chorus_asset/file/22822091/Viva_Patio.jpg",
        "https://media.timeout.com/images/105789629/750/562/image.jpg",
        "https://thegardenbarhove.com/wp-content/uploads/2022/11/Wedding-1.jpg",
        "https://boatupholsterymiami.com/wp-content/uploads/2023/12/Wedding-Bar-Decorations-Miami-5.jpg"
      ],
    },
  ],
  "images": [
    "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800&q=80",
    "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=800&q=80",
    "https://images.wsj.net/im-65599456?size=1.5",
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80",
    "https://assets.architecturaldigest.in/photos/6385cf3311f0276636badfb6/16:9/w_1280,c_limit/DSC_8367-Edit-W.png",
    "https://offloadmedia.feverup.com/secretsanfrancisco.com/wp-content/uploads/2021/09/31120752/kaiyo-rooftop.jpg"
  ],
  "galleryVideo": "https://www.youtube.com/watch?v=1234567890",
  "tags": ["Rustic", "Group Friendly", "Outdoor"],
  "isVerified": true,
  "createdAt": "2025-07-07T12:00:00Z",
  "updatedAt": "2025-07-07T12:00:00Z"
}


export { RESTAURANTS, restaurantData };
