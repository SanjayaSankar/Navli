
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { UserPreferences, Destination, Itinerary } from "../types";

// Initialize with the environment variable. 
// If process.env.API_KEY is undefined, it will throw an error during the API call checks below.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const modelName = "gemini-2.5-flash";

// Helper to calculate duration between dates
const getDaysDiff = (start: string, end: string) => {
  const date1 = new Date(start);
  const date2 = new Date(end);
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Include start day
};

export const getDestinationSuggestions = async (prefs: UserPreferences): Promise<Destination[]> => {
  if (!process.env.API_KEY) {
    throw new Error("Gemini API Key is missing. Please add API_KEY to your .env.local file.");
  }

  const duration = getDaysDiff(prefs.startDate, prefs.endDate);
  const travelersText = `Travelers: ${prefs.travelers.adults} Adults, ${prefs.travelers.children} Children`;

  const prompt = `
    As an expert travel agent, suggest 3 travel destinations based on these preferences:
    - Scope: ${prefs.travelScope} (Only suggest places inside India if 'Within India' is selected, otherwise International excluding India)
    - Style: ${prefs.travelStyle}
    - Party Size: ${travelersText}
    - Budget: ${prefs.budget}
    - Dates: ${prefs.startDate} to ${prefs.endDate} (${duration} days)
    - Origin City: ${prefs.originCity}
    - Interests: ${prefs.interests.join(", ")}

    Provide estimated TOTAL trip costs (flights + stay + activities) from ${prefs.originCity} for the entire party size for these specific dates.
    Output costs in INR (₹).
  `;

  const responseSchema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        name: { type: Type.STRING },
        country: { type: Type.STRING },
        description: { type: Type.STRING },
        matchScore: { type: Type.INTEGER },
        estimatedCost: { type: Type.STRING, description: "Total trip cost in INR for all travelers" },
        highlights: { type: Type.ARRAY, items: { type: Type.STRING } },
        flightPriceEstimate: { type: Type.STRING, description: "Estimated total flight cost in INR for all travelers" }
      },
      required: ["id", "name", "country", "description", "matchScore", "estimatedCost", "highlights", "flightPriceEstimate"]
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7
      }
    });

    const text = response.text;
    if (!text) return [];
    
    const data = JSON.parse(text) as Destination[];
    return data.map((dest, index) => ({
      ...dest,
      imageUrl: `https://picsum.photos/800/600?random=${index + 200}`
    }));

  } catch (error) {
    console.error("Error fetching suggestions:", error);
    throw new Error("Failed to generate destination suggestions.");
  }
};

export const getItinerary = async (destination: Destination, prefs: UserPreferences): Promise<Itinerary> => {
  if (!process.env.API_KEY) {
    throw new Error("Gemini API Key is missing. Please add API_KEY to your .env.local file.");
  }

  const duration = getDaysDiff(prefs.startDate, prefs.endDate);
  const travelersText = `${prefs.travelers.adults} Adults, ${prefs.travelers.children} Children`;

  const prompt = `
    Create a detailed ${duration}-day itinerary for ${destination.name}, ${destination.country}.
    Dates: ${prefs.startDate} to ${prefs.endDate}.
    Traveler Group: ${prefs.travelStyle} (${travelersText}).
    Interests: ${prefs.interests.join(", ")}.
    Origin: ${prefs.originCity}.
    
    Required:
    1. Daily plan with specific times.
    2. Real-time estimated pricing for flights and hotels for these dates.
    3. Costs in INR (₹) AND local currency of destination.
    4. Booking suggestions: Provide at least 2 distinct Flight options (e.g., Fastest, Cheapest) and 2 distinct Hotel options (Top Rated).
  `;

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      destinationName: { type: Type.STRING },
      duration: { type: Type.INTEGER },
      totalEstimatedCost: { type: Type.STRING, description: "Total in destination currency" },
      currency: { type: Type.STRING },
      inrEstimatedCost: { type: Type.STRING, description: "Total converted to INR" },
      summary: { type: Type.STRING },
      days: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            day: { type: Type.INTEGER },
            date: { type: Type.STRING, description: "YYYY-MM-DD" },
            title: { type: Type.STRING },
            activities: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  time: { type: Type.STRING },
                  activity: { type: Type.STRING },
                  description: { type: Type.STRING },
                  cost: { type: Type.STRING },
                  location: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ["food", "sightseeing", "activity", "travel"] }
                },
                required: ["time", "activity", "description", "type"]
              }
            }
          },
          required: ["day", "title", "activities"]
        }
      },
      budgetBreakdown: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            amount: { type: Type.NUMBER }
          },
          required: ["category", "amount"]
        }
      },
      bookingSuggestions: {
        type: Type.OBJECT,
        properties: {
          flights: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                airline: { type: Type.STRING },
                price: { type: Type.STRING },
                duration: { type: Type.STRING },
                stops: { type: Type.STRING },
                bookingUrl: { type: Type.STRING, description: "Search URL" }
              }
            }
          },
          hotels: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                price: { type: Type.STRING },
                rating: { type: Type.STRING },
                address: { type: Type.STRING },
                bookingUrl: { type: Type.STRING },
                features: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            }
          }
        }
      }
    },
    required: ["destinationName", "days", "budgetBreakdown", "bookingSuggestions", "inrEstimatedCost"]
  };

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        // thinkingConfig removed for Free Tier stability
        maxOutputTokens: 8192
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response");
    
    const data = JSON.parse(text) as Itinerary;

    // Updated: Use Google Flights Search Query for robustness
    const flightSearchQuery = `flights from ${prefs.originCity} to ${destination.name}`;
    const flightSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(flightSearchQuery)}`;
    
    data.bookingSuggestions.flights = data.bookingSuggestions.flights.map(f => ({
      ...f,
      bookingUrl: flightSearchUrl
    }));

    // Updated: Use Google Hotels/Booking.com general search
    const hotelSearchQuery = `hotels in ${destination.name}`;
    const hotelSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(hotelSearchQuery)}`;
    
    data.bookingSuggestions.hotels = data.bookingSuggestions.hotels.map(h => ({
      ...h,
      bookingUrl: hotelSearchUrl
    }));

    return data;

  } catch (error: any) {
    console.error("Error generating itinerary:", error);
    if (error.message?.includes('429')) {
       throw new Error("You've hit the free tier limit! Please wait a minute before trying again.");
    }
    throw new Error("Failed to generate itinerary. Please try again.");
  }
};

export const getTrendingDestinations = async (): Promise<any[]> => {
  if (!process.env.API_KEY) {
    // Return empty array if key is missing instead of crashing, but log error
    console.error("Gemini API Key is missing in .env.local");
    return [];
  }

  const prompt = `
    Generate a list of 6 trending travel destinations for this month globally.
    Return JSON array with fields: id (string), name, country, image_keyword (for searching image), rating (number 4.0-5.0).
  `;

  const responseSchema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        name: { type: Type.STRING },
        country: { type: Type.STRING },
        image_keyword: { type: Type.STRING },
        rating: { type: Type.NUMBER },
      },
      required: ["id", "name", "country", "rating", "image_keyword"]
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema
      }
    });

    const text = response.text;
    if(!text) return [];
    const data = JSON.parse(text);
    return data.map((d: any, i: number) => ({
      ...d,
      image: `https://picsum.photos/600/800?random=${i + 500}`
    }));
  } catch (e) {
    console.error(e);
    return [];
  }
};
