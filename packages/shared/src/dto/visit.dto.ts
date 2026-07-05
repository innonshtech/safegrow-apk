import { z } from "zod";

export const CreateVisitRequestSchema = z.object({
  id: z.string().uuid().optional(), // Allowed for offline-first sync
  attendanceId: z.string().uuid(),
  time: z.string().datetime(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  photoUrl: z.string().url(),
  vendorName: z.string().min(1, "Vendor name is required"),
  area: z.string().min(1, "Area is required"),
  outcome: z.enum(["MET", "ORDER_PLACED", "NOT_AVAILABLE"]),
  notes: z.string().optional(),
});

export type CreateVisitRequest = z.infer<typeof CreateVisitRequestSchema>;
