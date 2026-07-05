import { z } from "zod";

export const CheckInRequestSchema = z.object({
  time: z.string().datetime(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  photoUrl: z.string().url(), // We assume the client uploads to S3 and passes the URL, or passes a presigned object key
});

export type CheckInRequest = z.infer<typeof CheckInRequestSchema>;

export const CheckOutRequestSchema = z.object({
  time: z.string().datetime(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  photoUrl: z.string().url(),
});

export type CheckOutRequest = z.infer<typeof CheckOutRequestSchema>;
