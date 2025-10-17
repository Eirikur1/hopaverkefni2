// Type definitions for Venuu Events App

export interface VenuuEvent {
  id: string;
  title?: string;
  title_en?: string;
  language?: {
    en?: {
      title?: string;
      description?: string;
      place?: string;
    };
  };
  start?: string;
  date?: string;
  end?: string;
  location?: string;
  formatted_address?: string;
  city?: string;
  category?: string[];
  event_category?: string;
  event_image?: string;
  event_thumbnail?: string;
  image?: string;
  description?: string;
  detailed_description?: string;
  detailed_description_en?: string;
  price?: number | string;
  organizer?: string;
}

export interface Filters {
  category: string;
  location: string;
  sort: string;
  dateOrder: "asc" | "desc";
}

export interface AnimationOptions {
  duration?: number;
  delay?: number;
  easing?: string;
}
