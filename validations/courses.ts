import {
  categories,
  levels,
  modalities,
} from "@/utils/constants/courseDetails";
import { z } from "zod";

export const courseDetailsSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    maxNumberOfStudents: z
      .number()
      .min(1, "Max number of students is required")
      .max(100, "Max number of students must be less than 100"),
    startDate: z
      .date()
      .refine((date) => date >= new Date(new Date().setHours(0, 0, 0, 0)), {
        message: "Start date must be today or in the future",
      }),
    endDate: z
      .date()
      .refine((date) => date > new Date(new Date().setHours(0, 0, 0, 0)), {
        message: "End date must be today or in the future",
      }),
    level: z.enum(levels),
    modality: z.enum(modalities),
    category: z.enum(categories),
    dependencies: z.array(z.string().uuid()),
  })
  .refine((data) => data.startDate <= data.endDate, {
    message: "End date must be after or equal to start date",
  });
