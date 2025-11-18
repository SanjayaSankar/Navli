export enum TravelStyle {
  Solo = 'Solo',
  Couple = 'Couple',
  Family = 'Family',
  Group = 'Group'
}

export enum BudgetLevel {
  Budget = 'Budget Friendly',
  Moderate = 'Moderate',
  Luxury = 'Luxury',
  Flexible = 'Flexible'
}

export enum Interest {
  Adventure = 'Adventure',
  Culture = 'Culture & History',
  Food = 'Food & Dining',
  Relaxation = 'Relaxation',
  Nature = 'Nature',
  Nightlife = 'Nightlife',
  Shopping = 'Shopping',
  Art = 'Art & Museums'
}

export enum TravelScope {
  Domestic = 'Within India',
  International = 'International'
}

export interface UserPreferences {
  travelStyle: TravelStyle;
  travelers: {
    adults: number;
    children: number;
  };
  budget: BudgetLevel;
  interests: Interest[];
  originCity: string;
  startDate: string;
  endDate: string;
  travelScope: TravelScope;
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  description: string;
  matchScore: number; // 0-100
  estimatedCost: string;
  highlights: string[];
  imageUrl?: string; // Placeholder URL
  flightPriceEstimate?: string;
}

export interface ItineraryActivity {
  time: string;
  activity: string;
  description: string;
  cost: string;
  location: string;
  type: 'food' | 'sightseeing' | 'activity' | 'travel';
}

export interface DayPlan {
  day: number;
  title: string;
  date?: string;
  activities: ItineraryActivity[];
}

export interface FlightOption {
  airline: string;
  price: string;
  duration: string;
  stops: string;
  bookingUrl: string;
}

export interface HotelOption {
  name: string;
  price: string;
  rating: string;
  address: string;
  bookingUrl: string;
  features: string[];
}

export interface BookingDetails {
  flights: FlightOption[];
  hotels: HotelOption[];
}

export interface Itinerary {
  destinationName: string;
  duration: number;
  totalEstimatedCost: string;
  currency: string;
  inrEstimatedCost: string;
  days: DayPlan[];
  summary: string;
  budgetBreakdown: { category: string; amount: number }[];
  bookingSuggestions: BookingDetails;
}

// Navigation Types
export enum AppView {
  Home = 'Home',
  MyTrips = 'My Trips',
  Saved = 'Saved',
  Explore = 'Explore',
  Profile = 'Profile',
  Settings = 'Settings'
}

// Mock Interfaces for new pages
export interface SavedTrip {
  id: string;
  destination: string;
  image: string;
  dates: string;
  status: 'Upcoming' | 'Completed' | 'Draft';
}