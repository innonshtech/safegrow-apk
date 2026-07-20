import { z } from 'zod';

export const LeaveTypeSchema = z.enum(['CASUAL', 'PRIVILEGE', 'MEDICAL']);
export const LeaveStatusSchema = z.enum(['PENDING', 'APPROVED', 'REJECTED']);

export const CreateLeaveRequestSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  type: LeaveTypeSchema,
  reason: z.string().min(1, "Reason is required"),
  isAdminOverride: z.boolean().optional(),
  targetUserId: z.string().optional(),
});

export type CreateLeaveRequest = z.infer<typeof CreateLeaveRequestSchema>;
