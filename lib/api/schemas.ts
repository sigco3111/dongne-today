import { z } from 'zod';

export const WeatherResponseSchema = z.object({
  current: z.object({
    time: z.string(),
    temperature_2m: z.number(),
    weather_code: z.number().int(),
  }),
  hourly: z.object({
    time: z.array(z.string()),
    temperature_2m: z.array(z.number().nullable()),
    precipitation_probability: z.array(z.number().nullable()),
  }),
});

export const AirQualityResponseSchema = z.object({
  current: z.object({
    pm10: z.number(),
    pm2_5: z.number(),
    ozone: z.number(),
    european_aqi: z.number().int(),
  }),
  hourly: z.object({
    pm10: z.array(z.number().nullable()),
    pm2_5: z.array(z.number().nullable()),
  }),
});

export const PrecipitationResponseSchema = z.object({
  daily: z.object({
    time: z.array(z.string()),
    precipitation_sum: z.array(z.number().nullable()),
    precipitation_probability_max: z.array(z.number().nullable()),
  }),
  hourly: z.object({
    time: z.array(z.string()),
    precipitation: z.array(z.number().nullable()),
    precipitation_probability: z.array(z.number().nullable()),
  }),
});

export const PublicHolidaySchema = z.object({
  date: z.string(),
  localName: z.string(),
  name: z.string(),
  global: z.boolean(),
  types: z.array(z.string()),
});

export const GeocodingResultSchema = z.object({
  id: z.number(),
  name: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  country_code: z.string().optional(),
  admin1: z.string().optional(),
  admin2: z.string().optional(),
  admin3: z.string().optional(),
});

export const GeocodingResponseSchema = z.object({
  results: z.array(GeocodingResultSchema).optional(),
});

export const NominatimAddressSchema = z.object({
  neighbourhood: z.string().optional(),
  suburb: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
});

export const NominatimResponseSchema = z.object({
  address: NominatimAddressSchema.optional(),
});

export const NominatimSearchResultSchema = z.object({
  place_id: z.number().int(),
  lat: z.string(),
  lon: z.string(),
  display_name: z.string(),
  name: z.string().optional(),
  type: z.string().optional(),
  importance: z.number().optional(),
});

export const NominatimSearchResponseSchema = z.array(NominatimSearchResultSchema);

export type WeatherResponse = z.infer<typeof WeatherResponseSchema>;
export type AirQualityResponse = z.infer<typeof AirQualityResponseSchema>;
export type PrecipitationResponse = z.infer<typeof PrecipitationResponseSchema>;
export type PublicHoliday = z.infer<typeof PublicHolidaySchema>;
export type GeocodingResult = z.infer<typeof GeocodingResultSchema>;
export type NominatimResponse = z.infer<typeof NominatimResponseSchema>;
export type NominatimSearchResult = z.infer<typeof NominatimSearchResultSchema>;
