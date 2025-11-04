export type Property = {
  id: number;
  slug: string;
  title: string;
  description: string;
  price: number;
  property_type: string;
  operation: string;
  status: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  parking_spaces?: number | null;
  area?: number | null;
  address_line: string;
  city: string;
  state: string;
  country: string;
  latitude?: number | null;
  longitude?: number | null;
  cover_image_url?: string | null;
  gallery: string[];
  amenities: string[];
  tags: string[];
  created_at: string;
  updated_at: string;
};

export type PropertiesResponse = {
  data: Property[];
  total: number;
};

export type PropertyFormPayload = Omit<Property, "id" | "created_at" | "updated_at">;

export type LeadPreferences = {
  operation?: "buy" | "rent";
  locations?: string[];
  budget_min?: number;
  budget_max?: number;
  bedrooms?: number;
};

export type LeadPayload = {
  name: string;
  email?: string;
  phone?: string;
  message?: string;
  source?: string;
  property_id?: number;
  preferences?: LeadPreferences;
};

export type LeadRecommendation = {
  property: {
    id: number;
    slug: string;
    title: string;
    price: number;
    city: string;
    state: string;
    cover_image_url?: string | null;
    bedrooms?: number | null;
    bathrooms?: number | null;
    area?: number | null;
  };
  match_score: number;
};

export type LeadNextAction = {
  label: string;
  channel: string;
  scheduled_for?: string | null;
};

export type Lead = {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  message?: string | null;
  source?: string | null;
  preferences?: LeadPreferences | null;
  property_id?: number | null;
  status: string;
  score?: number | null;
  probability_to_close?: number | null;
  recommended_properties: LeadRecommendation[];
  next_best_actions: LeadNextAction[];
  created_at: string;
  updated_at: string;
};

export type LeadResponse = {
  message: string;
  lead: Lead;
};

export type LeadsListResponse = {
  data: Lead[];
  total: number;
};

export type AuthState = {
  token: string | null;
  expiresAt: string | null;
  isAuthenticated: boolean;
};
