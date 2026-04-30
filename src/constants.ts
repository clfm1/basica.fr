import { Product, Category } from './types';

export const CATEGORIES: Category[] = [
  {
    id: "fitness",
    name: "Abonnements Fitness",
    image: "/fitness.png",
    popularity: 180,
    pin: 2,
    productCount: 2
  },
  {
    id: "accounts",
    name: "Comptes Gaming",
    image: "/gaming.png",
    popularity: 77362,
    pin: 0,
    productCount: 4
  },
  {
    id: "fortnite",
    name: "Comptes Fortnite",
    image: "/accountfortnite.jpg",
    popularity: 1500,
    pin: 0,
    productCount: 2,
    parentId: "accounts"
  },
  {
    id: "roblox",
    name: "Comptes Roblox",
    image: "/accountroblox.png",
    popularity: 1200,
    pin: 0,
    productCount: 1,
    parentId: "accounts"
  },
  {
    id: "valorant",
    name: "Comptes Valorant",
    image: "/accountvalorante.jpg",
    popularity: 1100,
    pin: 0,
    productCount: 1,
    parentId: "accounts"
  },
  {
    id: "gta",
    name: "Comptes GTA V",
    image: "/accountgta.webp",
    popularity: 1000,
    pin: 0,
    productCount: 1,
    parentId: "accounts"
  },
  {
    id: "currency",
    name: "Monnaie de Jeu",
    image: "/monnaie.png",
    popularity: 64,
    pin: 0,
    productCount: 2
  }
];

export const PRODUCTS: Product[] = [
  {
    id: "basic-fit",
    name: "Abonnement Basic-Fit Ultimate",
    price: 10,
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1024&auto=format&fit=crop",
    categories: ["fitness"],
    popularity: 850,
    pin: 0,
    url: "#",
    description: "Abonnement Basic-Fit Ultimate, proposé de base à 35€ par mois. Il inclut l'accès illimité aux salles, Yanga illimité, le siège massant illimité et la possibilité d'inviter une personne avec vous en illimité.",
    features: ["Ultimate 35€/mois", "Yanga illimité", "Siège massant illimité", "Invité illimité"],
    variants: [
      { label: "Ultimate Mensuel", price: 10, originalPrice: 35 },
      { label: "Ultimate 3 Mois", price: 45, originalPrice: 105 },
      { label: "Ultimate Annuel", price: 90, originalPrice: 420 }
    ]
  },
  {
    id: "fitness-park",
    name: "Abonnement Fitness Park",
    price: 12,
    image: "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=1024&auto=format&fit=crop",
    categories: ["fitness"],
    popularity: 920,
    pin: 0,
    url: "#",
    description: "Fitness Park vous offre un environnement premium pour vos entraînements. Musculation, cardio, cross-training et bien plus dans des salles modernes ouvertes 7j/7.",
    features: ["Accès National", "Zone de Poids Libres", "Cross Training Hub", "Service Client 5*", "Douches Incluses"],
    variants: [
      { label: "Pass Liberté Mensuel", price: 12, originalPrice: 19 },
      { label: "Trimestre Intense", price: 55, originalPrice: 65 },
      { label: "Abonnement Annuel Intégral", price: 100, originalPrice: 135 }
    ]
  },
  {
    id: "fortnite-og",
    name: "Fortnite OG Account",
    price: 45,
    image: "/accountfortnite.jpg",
    categories: ["accounts", "fortnite"],
    popularity: 1500,
    pin: 1,
    url: "#",
    description: "Rare Fortnite accounts with OG skins like Renegade Raider or Pink Ghoul Trooper.",
    features: ["Full Access", "OG Skins", "Email Changeable", "Instant Delivery"]
  },
  {
    id: "fortnite-stacked",
    name: "Fortnite Stacked Account",
    price: 30,
    image: "/accountfortnite.jpg",
    categories: ["accounts", "fortnite"],
    popularity: 1200,
    pin: 0,
    url: "#",
    description: "Accounts with 100+ skins and rare emotes.",
    features: ["100+ Skins", "Safe & Secure", "Works on All Platforms"]
  },
  {
    id: "roblox-stacked",
    name: "Roblox Stacked Account",
    price: 20,
    image: "/accountroblox.png",
    categories: ["accounts", "roblox"],
    popularity: 800,
    pin: 0,
    url: "#",
    description: "Roblox accounts with multiple gamepasses and rare items.",
    features: ["Many Gamepasses", "Rare Items", "Verified Clean"]
  },
  {
    id: "valorant-account",
    name: "Valorant Ranked Ready",
    price: 15,
    image: "/accountvalorante.jpg",
    categories: ["accounts", "valorant"],
    popularity: 800,
    pin: 0,
    url: "#",
    description: "Ranked ready Valorant accounts with various skins and levels.",
    features: ["Ranked Unlock", "Email Changeable", "Safe & Secure"]
  },
  {
    id: "gta-account",
    name: "GTA V Modded Account",
    price: 25,
    image: "/accountgta.webp",
    categories: ["accounts", "gta"],
    popularity: 600,
    pin: 0,
    url: "#",
    description: "GTA V modded accounts for PC/Console with billions in cash and high rank.",
    features: ["Max Cash", "Modded Outfits", "Anti-Ban Guarantee"]
  },
  {
    id: "v-bucks",
    name: "Fortnite V-Bucks",
    price: 9,
    image: "https://images.unsplash.com/photo-1589241062272-c0a000072dfa?q=80&w=1024&auto=format&fit=crop",
    categories: ["currency"],
    popularity: 2000,
    pin: 1,
    url: "#",
    description: "Cheap V-Bucks topped directly onto your account.",
    features: ["Fast Delivery", "Lowest Prices", "24/7 Support"]
  },
  {
    id: "robux",
    name: "Roblox Robux",
    price: 5,
    image: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?q=80&w=1024&auto=format&fit=crop",
    categories: ["currency"],
    popularity: 1800,
    pin: 0,
    url: "#",
    description: "Safe Robux transfer to your account via Gamepass/Group.",
    features: ["Safe Transfer", "Bonus Robux", "Low Fees"]
  }
];
