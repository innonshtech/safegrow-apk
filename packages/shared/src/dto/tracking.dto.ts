import { z } from "zod";

export const LocationPingSchema = z.object({
  id: z.string().uuid().optional(),
  attendanceId: z.string().uuid(),
  time: z.string().datetime(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  accuracy: z.number().optional(),
  speed: z.number().optional(),
});

export type LocationPing = z.infer<typeof LocationPingSchema>;

export const BatchLocationPingRequestSchema = z.object({
  pings: z.array(LocationPingSchema),
});

export type BatchLocationPingRequest = z.infer<typeof BatchLocationPingRequestSchema>;
