import { z } from "zod";
import { questions } from "./questions";

const shape: Record<string, z.ZodType> = {};
for (const q of questions) {
  if (q.type === "single") {
    shape[q.id] = z.enum(q.options.map((o) => o.value) as [string, ...string[]]).optional();
  } else if (q.type === "multi") {
    shape[q.id] = z.array(z.enum(q.options.map((o) => o.value) as [string, ...string[]])).max(q.options.length).optional();
  } else if (q.type === "scale") {
    shape[q.id] = z.number().int().min(q.min).max(q.max).optional();
  } else {
    shape[q.id] = z.string().max(q.maxLength).optional();
  }
}

export const submissionSchema = z.object({
  answers: z.object(shape).strict(),
  website: z.string().optional(), // honeypot: real users leave this empty
});
