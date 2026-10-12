export type Option = { value: string; label: string; column?: string };

export type Question =
  | { id: string; type: "single"; title: string; column: string; options: Option[] }
  | { id: string; type: "multi"; title: string; hint?: string; options: (Option & { column: string })[]; exclusive?: string }
  | { id: string; type: "scale"; title: string; column: string; min: number; max: number; minLabel: string; maxLabel: string }
  | { id: string; type: "text"; title: string; column: string; placeholder: string; maxLength: number };

export const questions: Question[] = [
  {
    id: "q1",
    type: "single",
    title: "How often do you typically buy new clothes?",
    column: "q1_buy_frequency",
    options: [
      { value: "weekly", label: "Weekly" },
      { value: "monthly", label: "Monthly" },
      { value: "every_few_months", label: "Every few months" },
      { value: "rarely", label: "Rarely" },
    ],
  },
  {
    id: "q2",
    type: "multi",
    title: "When you shop, where do you usually go?",
    hint: "Select all that apply",
    options: [
      { value: "fast_fashion", column: "q2_shop_fast_fashion", label: "Fast Fashion Brands" },
      { value: "street_markets", column: "q2_shop_street_markets", label: "Local Street Markets" },
      { value: "thrift", column: "q2_shop_thrift", label: "Thrift Stores" },
      { value: "sustainable", column: "q2_shop_sustainable", label: "Sustainable Brands" },
    ],
  },
  {
    id: "q3",
    type: "single",
    title: "What is the number 1 factor driving your clothing purchases?",
    column: "q3_top_factor",
    options: [
      { value: "price", label: "Price" },
      { value: "trends", label: "Trends" },
      { value: "quality", label: "Quality" },
      { value: "eco_friendly", label: "Eco-friendly" },
    ],
  },
  {
    id: "q4",
    type: "single",
    title: "Roughly how many items of clothing in your closet have you NOT worn in the past year?",
    column: "q4_unworn_items",
    options: [
      { value: "0-5", label: "0-5 items" },
      { value: "6-10", label: "6-10 items" },
      { value: "11-20", label: "11-20 items" },
      { value: "20+", label: "More than 20 items (My closet is overflowing!)" },
    ],
  },
  {
    id: "q5",
    type: "single",
    title: "Think about the last 5 items of clothing you got rid of. Where did they go?",
    column: "q5_disposal",
    options: [
      { value: "donated", label: "Donated" },
      { value: "passed_down", label: "Passed down" },
      { value: "repurposed", label: "Repurposed" },
      { value: "trash", label: "Thrown in the trash" },
    ],
  },
  {
    id: "q6",
    type: "scale",
    title: "On a scale of 1 to 5, how aware are you of where municipal solid waste actually ends up?",
    column: "q6_waste_awareness",
    min: 1,
    max: 5,
    minLabel: "Completely clueless",
    maxLabel: "Highly informed",
  },
  {
    id: "q7",
    type: "single",
    title: "Have you ever considered the water footprint of your clothes (e.g., 2,700 liters for one cotton t-shirt)?",
    column: "q7_water_footprint",
    options: [
      { value: "influences_me", label: "Yes it influences me" },
      { value: "heard_still_buy", label: "I've heard about it but still buy" },
      { value: "no_idea", label: "No I had no idea" },
    ],
  },
  {
    id: "q8",
    type: "single",
    title: "Would you be willing to pay 10-20% more for an item of clothing if you knew it was sustainably and ethically made?",
    column: "q8_pay_more",
    options: [
      { value: "yes", label: "Yes absolutely" },
      { value: "maybe", label: "Maybe - it depends on the item" },
      { value: "no", label: "No - price is my top priority" },
    ],
  },
  {
    id: "q9",
    type: "multi",
    title: "Which of these sustainable fashion habits would you realistically adopt in the next 6 months?",
    hint: "Select all that apply",
    exclusive: "none",
    options: [
      { value: "swap", column: "q9_habit_swap", label: "Clothing swap" },
      { value: "thrifting", column: "q9_habit_thrifting", label: "Thrifting" },
      { value: "mending", column: "q9_habit_mending", label: "Basic mending" },
      { value: "no_buy_month", column: "q9_habit_no_buy_month", label: "No-Buy Month" },
      { value: "none", column: "q9_habit_none", label: "None" },
    ],
  },
  {
    id: "q10",
    type: "text",
    title: "What is the biggest barrier preventing you from shopping sustainably?",
    column: "q10_barrier",
    placeholder: "Type your answer…",
    maxLength: 500,
  },
];

export type Answers = Record<string, string | number | string[] | undefined>;

/** Map UI answers to the flat DB row (one column per single answer, one boolean per multi option). */
export function toRow(answers: Answers): Record<string, string | number | boolean | null> {
  const row: Record<string, string | number | boolean | null> = {};
  for (const q of questions) {
    const a = answers[q.id];
    if (q.type === "multi") {
      const picked = Array.isArray(a) ? a : [];
      for (const o of q.options) row[o.column] = picked.includes(o.value);
    } else if (q.type === "text") {
      const t = typeof a === "string" ? a.trim() : "";
      row[q.column] = t ? t.slice(0, q.maxLength) : null;
    } else {
      row[q.column] = a === undefined || a === "" ? null : (a as string | number);
    }
  }
  return row;
}
