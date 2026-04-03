import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  analyses: defineTable({
    userId: v.id("users"),
    imageBase64: v.string(),
    analysis: v.string(),
    fishSpots: v.array(v.object({
      x: v.number(),
      y: v.number(),
      confidence: v.string(),
      species: v.string(),
      reasoning: v.string(),
    })),
    waterType: v.string(),
    overallScore: v.number(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
});
