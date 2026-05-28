export interface Property {
  id: number;
  title: string;
  description: string;
  price: number;
  type: string;
  status: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  image: string;
  galleryImages?: string;
  virtualTourUrl?: string;
  city: string;
  state: string;
  featured: boolean;
  created_at: string;
}

export interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  message: string;
  propertyId: number | null;
  status: string;
  created_at: string;
}

export interface Stats {
  totalProperties: number;
  totalLeads: number;
  propertiesForSale: number;
  propertiesForRent: number;
}
