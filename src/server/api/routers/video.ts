import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const videoRouter = createTRPCRouter({
  getVideoVotes: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.video.findFirst({
        where: { id: input.id },
        include: { votes: true },
      });
    }),
  getOptionSigns: publicProcedure
    .input(z.object({ word: z.string() }))
    .query(({ ctx, input }) => {
      const { word } = input;
      return ctx.prisma.sign.findMany({
        where: { word: { word: { startsWith: word } } },
        include: { word: true },
      });
    }),
  createSignVideo: publicProcedure
    .input(
      z.object({
        url: z.string(),
        signId: z.string().optional(),
        createdBy: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const video = await ctx.prisma.video.create({
        data: {
          url: input.url,
          createdBy: input.createdBy,
        },
      });
      if (!video) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Failed creating Sign Video",
        });
      }
      return { id: video.id };
    }),
});
