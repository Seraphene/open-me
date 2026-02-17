export type Product = {
  id: string;
  name: string;
  price: number;
  currency: "INR" | "USD";
  category: "cakes" | "flowers" | "hampers";
  image_url: string;
  is_bestseller: boolean;
  occasion_tags: Array<"birthday" | "anniversary" | "valentine" | "friendship">;
};

export const products: Product[] = [
  {
    id: "p_101",
    name: "Box of pink roses",
    price: 1500,
    currency: "INR",
    category: "flowers",
    image_url:
      "https://images.unsplash.com/photo-1494336934272-fd4b47f6f6f3?auto=format&fit=crop&w=900&q=70",
    is_bestseller: true,
    occasion_tags: ["birthday", "anniversary", "valentine", "friendship"]
  },
  {
    id: "p_102",
    name: "Friendship choco truffle cake",
    price: 899,
    currency: "INR",
    category: "cakes",
    image_url:
      "https://images.unsplash.com/photo-1559620192-032c4bc4674e?auto=format&fit=crop&w=900&q=70",
    is_bestseller: true,
    occasion_tags: ["birthday", "friendship"]
  },
  {
    id: "p_103",
    name: "Luxury celebration hamper",
    price: 2299,
    currency: "INR",
    category: "hampers",
    image_url:
      "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=900&q=70",
    is_bestseller: true,
    occasion_tags: ["anniversary", "friendship"]
  },
  {
    id: "p_104",
    name: "Sunflower joy bouquet",
    price: 1299,
    currency: "INR",
    category: "flowers",
    image_url:
      "https://images.unsplash.com/photo-1470509037663-253afd7f0f51?auto=format&fit=crop&w=900&q=70",
    is_bestseller: false,
    occasion_tags: ["birthday", "friendship"]
  },
  {
    id: "p_105",
    name: "Belgian red velvet cake",
    price: 1099,
    currency: "INR",
    category: "cakes",
    image_url:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=70",
    is_bestseller: true,
    occasion_tags: ["anniversary", "valentine", "birthday"]
  },
  {
    id: "p_106",
    name: "Global gourmet gift box",
    price: 49,
    currency: "USD",
    category: "hampers",
    image_url:
      "https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=900&q=70",
    is_bestseller: true,
    occasion_tags: ["birthday", "anniversary"]
  }
];
