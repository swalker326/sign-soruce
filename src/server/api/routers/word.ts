import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const wordRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.word.findMany({});
  }),
  getWordById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const sign = await ctx.prisma.word.findUnique({
        where: { id: input.id },
      });
      if (!sign) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Word Not Found" });
      }
      return sign;
    }),
  getOptionWords: publicProcedure
    .input(z.object({ word: z.string() }))
    .query(({ ctx, input }) => {
      const { word } = input;
      return ctx.prisma.word.findMany({
        where: { word: { startsWith: word } },
      });
    }),
});
