import { z } from 'zod';

export const createLeadSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Please enter a valid email')
    .toLowerCase(),
  status: z
    .enum(['New', 'Contacted', 'Qualified', 'Lost'], {
      errorMap: () => ({
        message: 'Status must be one of: New, Contacted, Qualified, Lost',
      }),
    })
    .default('New'),
  source: z.enum(['Website', 'Instagram', 'Referral'], {
    errorMap: () => ({
      message: 'Source must be one of: Website, Instagram, Referral',
    }),
  }),
});

export const updateLeadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters')
    .optional(),
  email: z
    .string()
    .trim()
    .email('Please enter a valid email')
    .toLowerCase()
    .optional(),
  status: z
    .enum(['New', 'Contacted', 'Qualified', 'Lost'], {
      errorMap: () => ({
        message: 'Status must be one of: New, Contacted, Qualified, Lost',
      }),
    })
    .optional(),
  source: z
    .enum(['Website', 'Instagram', 'Referral'], {
      errorMap: () => ({
        message: 'Source must be one of: Website, Instagram, Referral',
      }),
    })
    .optional(),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
