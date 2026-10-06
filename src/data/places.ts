/**
 * ============================================================================
 * DEMO / SEED / PROTOTYPE DATA (MOBILE B2C)
 * ============================================================================
 * CLASIFICACIÓN: PROTOTIPO / DEMO / SEED DATA UNICAMENTE.
 * 
 * NO utilizar este archivo como fuente definitiva de catálogo en producción.
 * La aplicación móvil Valpar B2C está configurada para consumir los datos
 * productivos en vivo desde la API backend:
 *   - GET /api/places/discovery
 *   - GET /api/places/:id
 *   - GET /api/routes
 *   - GET /api/recommendations
 * ============================================================================
 */

import { Place } from '../types';

export const PLACES_DATA: Place[] = [
  {
    id: 'place-01',
    partnerId: 'partner-turri',
    status: 'PARTNER',
    name: 'Café Turri',
    tagline: 'La vista más emblemática de Valparaíso',
    description: 'Ubicado en Cerro Concepción. Vista panorámica a la bahía con café de especialidad y pastelería artesanal.',
    category: 'cafe',
    categories: ['cafe', 'comer', 'cultura'],
    experienceTags: ['Café con vista', 'Experiencia romántica', 'Patrimonio cerro'],
    imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.8,
    reviewCount: 342,
    verifiedVisits: 1280,
    priceLevel: '$$$',
    location: {
      address: 'Paseo Gervasoni 161',
      city: 'Valparaíso',
      district: 'Cerro Concepción',
      latitude: -33.0425,
      longitude: -71.6256,
      zone: 'Cerros Porteños'
    },
    openingHours: 'Lun - Dom: 09:00 - 22:00',
    phone: '+56 32 225 2091',
    nfcActive: true,
    nfcTagId: 'nfc-turri-01',
    isFeatured: true,
    currentOffer: 'Bienvenida Valpar: Tarta artesanal de regalo en tu 1ª visita NFC',
    menu: [
      { id: 'm1', name: 'Capuchino Turri de Vainilla', description: 'Espreso doble con leche al vapor.', price: 3800, category: 'Cafetería', imageUrl: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=400&q=80', available: true },
      { id: 'm2', name: 'Tarta de Limón & Merengue', description: 'Receta artesanal.', price: 4200, category: 'Postres', imageUrl: 'https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=400&q=80', available: true }
    ]
  },
  {
    id: 'place-02',
    partnerId: 'partner-altamira',
    status: 'PARTNER',
    name: 'Cervecería Altamira',
    tagline: 'La cuna de la cerveza artesanal porteña',
    description: 'Pie de Ascensor Reina Victoria. Cervezas recién tiradas y jazz en vivo.',
    category: 'noche',
    categories: ['noche', 'comer'],
    experienceTags: ['Para ir con amigos', 'Cerveza artesanal', 'Música en vivo'],
    imageUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.7,
    reviewCount: 512,
    verifiedVisits: 2150,
    priceLevel: '$$',
    location: {
      address: 'El Elías 126',
      city: 'Valparaíso',
      district: 'Cerro Alegre',
      latitude: -33.0441,
      longitude: -71.6248,
      zone: 'Cerros Porteños'
    },
    openingHours: 'Mar - Dom: 13:00 - 01:00',
    phone: '+56 32 319 3680',
    nfcActive: true,
    nfcTagId: 'nfc-altamira-01',
    isFeatured: true,
    currentOffer: 'Happy Hour de Pintas para clientes con Check-In NFC',
    menu: [
      { id: 'm4', name: 'Schop Altamira Amber Ale 500ml', description: 'Cerveza de notas acarameladas.', price: 4500, category: 'Cervezas', imageUrl: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=400&q=80', available: true }
    ]
  },
  {
    id: 'place-03',
    status: 'RECOMMENDED',
    name: 'Mar de Amores - Caleta Higuerillas',
    tagline: 'Mariscos frescos y atardeceres de Concón',
    description: 'Especialistas en machas a la parmesana, reineta a la plancha y caldillo de congrio recién desembarcado.',
    category: 'comer',
    categories: ['comer', 'playas'],
    experienceTags: ['Comida marina', 'Vista al mar', 'Atardecer único'],
    imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.9,
    reviewCount: 418,
    verifiedVisits: 1890,
    priceLevel: '$$$',
    location: {
      address: 'Av. Borgoño 21100',
      city: 'Concón',
      district: 'Higuerillas',
      latitude: -32.9150,
      longitude: -71.5230,
      zone: 'Borde Costero Concón'
    },
    openingHours: 'Mié - Dom: 12:30 - 20:30',
    phone: '+56 32 281 1234',
    nfcActive: false,
    nfcTagId: '',
    isFeatured: true,
    menu: [
      { id: 'm6', name: 'Machas a la Parmesana', description: 'Machas vivas horneadas con vino blanco.', price: 13500, category: 'Entradas', imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=400&q=80', available: true }
    ]
  },
  {
    id: 'place-04',
    status: 'DISCOVERED',
    name: 'Empanadas Delicias de la Costa',
    tagline: 'Las mejores empanadas fritas de Reñaca y Viña',
    description: 'Más de 35 variedades de empanadas fritas de masa crujiente.',
    category: 'comer',
    categories: ['comer', 'playas'],
    experienceTags: ['Paso rápido', 'Experiencia económica', 'Playa Reñaca'],
    imageUrl: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.6,
    reviewCount: 289,
    verifiedVisits: 980,
    priceLevel: '$',
    location: {
      address: 'Av. Borgoño 14500, Sector 4',
      city: 'Viña del Mar',
      district: 'Reñaca',
      latitude: -32.9680,
      longitude: -71.5540,
      zone: 'Borde Costero Viña'
    },
    openingHours: 'Lun - Dom: 10:30 - 21:00',
    phone: '+56 32 297 8811',
    nfcActive: false,
    nfcTagId: '',
    menu: [
      { id: 'm8', name: 'Empanada Camarón Queso', description: 'Camarones ecuatorianos y queso fundido.', price: 3900, category: 'Empanadas', imageUrl: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=400&q=80', available: true }
    ]
  },
  {
    id: 'place-05',
    status: 'RECOMMENDED',
    name: 'Paseo & Ascensor 21 de Mayo',
    tagline: 'Patrimonio y artesanía sobre la bahía',
    description: 'Paseo mirador tradicional en Cerro Artillería.',
    category: 'cultura',
    categories: ['cultura', 'naturaleza'],
    experienceTags: ['Lugar secreto', 'Patrimonio cerro', 'Vista al mar'],
    imageUrl: 'https://images.unsplash.com/photo-1589556264800-08ae9e129a8c?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1589556264800-08ae9e129a8c?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.8,
    reviewCount: 620,
    verifiedVisits: 3100,
    priceLevel: '$',
    location: {
      address: 'Paseo 21 de Mayo s/n',
      city: 'Valparaíso',
      district: 'Cerro Artillería',
      latitude: -33.0330,
      longitude: -71.6310,
      zone: 'Cerros Porteños'
    },
    openingHours: 'Lun - Dom: 08:00 - 20:00',
    phone: '+56 32 293 0000',
    nfcActive: false,
    nfcTagId: '',
    menu: []
  },
  {
    id: 'place-06',
    status: 'DISCOVERED',
    name: 'Parque Nacional La Campana & El Patagual',
    tagline: 'Reserva de la Biósfera y tradición campesina',
    description: 'Senderos de palmas chilenas ancestrales y gastronomía criolla en Olmué.',
    category: 'naturaleza',
    categories: ['naturaleza', 'comer'],
    experienceTags: ['Naturaleza pura', 'Familiar', 'Experiencia económica'],
    imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.9,
    reviewCount: 195,
    verifiedVisits: 840,
    priceLevel: '$$',
    location: {
      address: 'Sector Granizo s/n',
      city: 'Olmué',
      district: 'Granizo',
      latitude: -32.9900,
      longitude: -71.1200,
      zone: 'Valle del Marga Marga'
    },
    openingHours: 'Mar - Dom: 08:30 - 17:30',
    phone: '+56 33 244 1122',
    nfcActive: false,
    nfcTagId: '',
    menu: [
      { id: 'm10', name: 'Pastel de Choclo Criollo', description: 'Horneado en greda con pino de pavo.', price: 8900, category: 'Tradición', imageUrl: 'https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&w=400&q=80', available: true }
    ]
  },
  {
    id: 'place-07',
    status: 'RECOMMENDED',
    name: 'El Cardenal Café & Mirador',
    tagline: 'Café de especialidad con terraza secreta hacia la bahía',
    description: 'En lo alto de Cerro Alegre, un rincón rodeado de murales y café de origen.',
    category: 'cafe',
    categories: ['cafe', 'cultura'],
    experienceTags: ['Café con vista', 'Lugar secreto', 'Experiencia romántica'],
    imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.9,
    reviewCount: 184,
    verifiedVisits: 620,
    priceLevel: '$$',
    location: {
      address: 'Paseo Dimalow 260',
      city: 'Valparaíso',
      district: 'Cerro Alegre',
      latitude: -33.0435,
      longitude: -71.6260,
      zone: 'Cerros Porteños'
    },
    openingHours: 'Mié - Dom: 10:00 - 20:00',
    phone: '+56 32 291 4455',
    nfcActive: false,
    nfcTagId: '',
    menu: [
      { id: 'm11', name: 'Flat White Cerro Alegre', description: 'Espreso doble colombiano.', price: 3400, category: 'Cafetería', imageUrl: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=400&q=80', available: true }
    ]
  },
  {
    id: 'place-08',
    status: 'DISCOVERED',
    name: 'Bar La Playa',
    tagline: 'El bar más antiguo en funcionamiento de Valparaíso',
    description: 'Fundado en 1908 en el histórico Barrio Puerto. Barra de madera tallada y terremotos.',
    category: 'noche',
    categories: ['noche', 'cultura'],
    experienceTags: ['Bares tradicionales', 'Patrimonio cerro', 'Música en vivo'],
    imageUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.7,
    reviewCount: 310,
    verifiedVisits: 1450,
    priceLevel: '$',
    location: {
      address: 'Serrano 568',
      city: 'Valparaíso',
      district: 'Barrio Puerto',
      latitude: -33.0360,
      longitude: -71.6290,
      zone: 'Barrio Puerto Historic'
    },
    openingHours: 'Lun - Sáb: 17:00 - 02:00',
    phone: '+56 32 225 9988',
    nfcActive: false,
    nfcTagId: '',
    menu: [
      { id: 'm12', name: 'Terremoto Porteño Tradicional', description: 'Vino pipeño con helado de piña.', price: 4900, category: 'Coctelería', imageUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=400&q=80', available: true }
    ]
  },
  {
    id: 'place-09',
    status: 'PARTNER',
    name: 'Emporio La Rosa - Castillo Wulff',
    tagline: 'Heladería artesanal junto al mar de Viña del Mar',
    description: 'Ubicado en la avenida Marina frente al Castillo Wulff. Helados artesanal de rosa y miel de ulmo.',
    category: 'cafe',
    categories: ['cafe', 'playas'],
    experienceTags: ['Heladería artesanal', 'Vista al mar', 'Familiar'],
    imageUrl: 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.8,
    reviewCount: 520,
    verifiedVisits: 2890,
    priceLevel: '$$',
    location: {
      address: 'Av. Marina 50',
      city: 'Viña del Mar',
      district: 'Castillo Wulff',
      latitude: -33.0230,
      longitude: -71.5580,
      zone: 'Borde Costero Viña'
    },
    openingHours: 'Lun - Dom: 11:00 - 21:00',
    phone: '+56 32 268 4400',
    nfcActive: true,
    nfcTagId: 'nfc-emporio-01',
    isFeatured: true,
    currentOffer: 'Cono doble al precio de simple en tu 1ª visita NFC',
    menu: [
      { id: 'm13', name: 'Helado Barquillón 2 Sabores', description: 'Rosa natural y Chocolate Amargo.', price: 3900, category: 'Helados', imageUrl: 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=400&q=80', available: true }
    ]
  },
  {
    id: 'place-10',
    status: 'RECOMMENDED',
    name: 'La Caperucita y el Lobo',
    tagline: 'Gastronomía de autor en una casona vintage de cerro',
    description: 'En Cerro Florida, cerca de La Sebastiana. Cocina íntima y pescados del día.',
    category: 'comer',
    categories: ['comer', 'cultura'],
    experienceTags: ['Experiencia romántica', 'Gastronomía de autor', 'Lugar secreto'],
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.9,
    reviewCount: 260,
    verifiedVisits: 940,
    priceLevel: '$$$$',
    location: {
      address: 'Ferrari 471',
      city: 'Valparaíso',
      district: 'Cerro Florida',
      latitude: -33.0470,
      longitude: -71.6180,
      zone: 'Cerros Porteños'
    },
    openingHours: 'Mar - Sáb: 19:30 - 23:30',
    phone: '+56 32 320 0212',
    nfcActive: false,
    nfcTagId: '',
    menu: [
      { id: 'm14', name: 'Atún Sellado en Sésamo', description: 'Atún fresco de bahía sobre risotto.', price: 16900, category: 'Platos de Autor', imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80', available: true }
    ]
  },
  {
    id: 'place-11',
    status: 'PARTNER',
    name: 'Restobar El Chiringuito Concón',
    tagline: 'Pescados y coctelería tropical sobre las rocas de Concón',
    description: 'Terraza volada sobre el océano. Pisco sour y mariscos vivos.',
    category: 'comer',
    categories: ['comer', 'playas', 'noche'],
    experienceTags: ['Comida marina', 'Vista al mar', 'Para ir con amigos'],
    imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.8,
    reviewCount: 480,
    verifiedVisits: 2310,
    priceLevel: '$$$',
    location: {
      address: 'Av. Borgoño 24000',
      city: 'Concón',
      district: 'Concón Costero',
      latitude: -32.9080,
      longitude: -71.5200,
      zone: 'Borde Costero Concón'
    },
    openingHours: 'Lun - Dom: 12:00 - 00:00',
    phone: '+56 32 281 9900',
    nfcActive: true,
    nfcTagId: 'nfc-chiringuito-01',
    isFeatured: true,
    currentOffer: 'Pisco Sour de bienvenida gratis en tu 1ª visita NFC',
    menu: [
      { id: 'm15', name: 'Ceviche Mixto El Chiringuito', description: 'Corvina y camarones en leche de tigre.', price: 12900, category: 'Entradas', imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=400&q=80', available: true }
    ]
  },
  {
    id: 'place-12',
    status: 'DISCOVERED',
    name: 'Café de la Poesía',
    tagline: 'Libros, café y ambiente literario en Cerro Alegre',
    description: 'Espacio cultural independiente con estantes de libros y jazz suave.',
    category: 'cafe',
    categories: ['cafe', 'cultura'],
    experienceTags: ['Café de especialidad', 'Cultura', 'Ambiente relajado'],
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.7,
    reviewCount: 142,
    verifiedVisits: 510,
    priceLevel: '$',
    location: {
      address: 'Almirante Montt 420',
      city: 'Valparaíso',
      district: 'Cerro Alegre',
      latitude: -33.0440,
      longitude: -71.6250,
      zone: 'Cerros Porteños'
    },
    openingHours: 'Mar - Dom: 11:00 - 19:30',
    phone: '+56 32 291 7722',
    nfcActive: false,
    nfcTagId: '',
    menu: [
      { id: 'm16', name: 'Espreso Nerudiano & Muffin', description: 'Café cargado estilo italiano con muffin.', price: 3600, category: 'Cafetería', imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=400&q=80', available: true }
    ]
  }
];
