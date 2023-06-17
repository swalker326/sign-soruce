import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const signRouter = createTRPCRouter({
  signs: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.sign.findMany({
      include: { images: true, word: true },
    });
  }),
  getSignById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const sign = await ctx.prisma.sign.findUnique({
        where: { id: input.id },
        include: { images: true, word: true, videos: true },
      });
      if (!sign) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Sign not found" });
      }
      return sign;
    }),
});
