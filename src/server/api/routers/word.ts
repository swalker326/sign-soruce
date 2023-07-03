import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  privateProdedure,
  publicProcedure,
} from "~/server/api/trpc";

export const wordRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.word.findMany({
      include: { signs: { include: { video: true } } },
    });
  }),
  getWordById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const sign = await ctx.prisma.word.findUnique({
        where: { id: input.id },
        include: {
          images: true,
          signs: { include: { video: true } },
        },
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
  addWordImage: privateProdedure
    .input(
      z.object({ wordId: z.string(), createdBy: z.string(), url: z.string() })
    )
    .mutation(({ ctx, input }) => {
      const { wordId, createdBy, url } = input;
      return ctx.prisma.wordImage.create({
        data: {
          url,
          createdBy,
          wordId,
        },
      });
    }),
});
