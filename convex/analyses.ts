import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("analyses")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(20);
  },
});

export const create = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.db.insert("analyses", {
      ...args,
      userId,
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("analyses") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const analysis = await ctx.db.get(args.id);
    if (!analysis || analysis.userId !== userId) throw new Error("Not found");
    await ctx.db.delete(args.id);
  },
});
