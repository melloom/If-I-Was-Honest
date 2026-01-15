import { z } from 'zod'

// Email validation
export const emailSchema = z
  .string()
  .email('Invalid email address')
  .min(5, 'Email must be at least 5 characters')
  .max(255, 'Email must be less than 255 characters')
  .toLowerCase()
  .trim()

// Password validation
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  )

// Sign up schema
export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

// Sign in schema
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

// Entry content validation
export const entryContentSchema = z
  .string()
  .min(1, 'Entry cannot be empty')
  .max(50000, 'Entry is too long (max 50,000 characters)')
  .trim()

// Entry title validation
export const entryTitleSchema = z
  .string()
  .max(500, 'Title is too long (max 500 characters)')
  .trim()
  .optional()

// Entry status validation
export const entryStatusSchema = z.enum([
  'NO_STATUS',
  'STILL_TRUE',
  'IVE_GROWN',
  'I_WAS_COPING',
  'I_LIED',
])

// Create entry schema
export const createEntrySchema = z.object({
  title: entryTitleSchema,
  content: entryContentSchema,
  status: entryStatusSchema.default('NO_STATUS'),
  moodIds: z.array(z.string().uuid()).max(10).optional(),
  tagIds: z.array(z.string().uuid()).max(20).optional(),
})

// Update entry schema
export const updateEntrySchema = createEntrySchema.partial()

// Mood/Tag name validation
export const tagNameSchema = z
  .string()
  .min(1, 'Name cannot be empty')
  .max(100, 'Name is too long (max 100 characters)')
  .trim()
  .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Name can only contain letters, numbers, spaces, hyphens, and underscores')

// Color validation (hex color)
export const colorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format (use #RRGGBB)')
  .optional()

// Create mood schema
export const createMoodSchema = z.object({
  name: tagNameSchema,
  color: colorSchema,
})

// Create tag schema
export const createTagSchema = z.object({
  name: tagNameSchema,
})

// Pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

// Search/filter schema
export const filterSchema = z.object({
  search: z.string().max(200).optional(),
  status: entryStatusSchema.optional(),
  moodIds: z.array(z.string().uuid()).optional(),
  tagIds: z.array(z.string().uuid()).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
})

export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
export type CreateEntryInput = z.infer<typeof createEntrySchema>
export type UpdateEntryInput = z.infer<typeof updateEntrySchema>
export type CreateMoodInput = z.infer<typeof createMoodSchema>
export type CreateTagInput = z.infer<typeof createTagSchema>
export type PaginationInput = z.infer<typeof paginationSchema>
export type FilterInput = z.infer<typeof filterSchema>
