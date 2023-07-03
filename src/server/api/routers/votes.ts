import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const voteRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        videoId: z.string(),
        createdBy: z.string(),
        signId: z.string(),
        vote: z.number().min(-1).max(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const vote = await ctx.prisma.vote.create({
        data: {
          video: { connect: { id: input.videoId } },
          user: { connect: { id: input.createdBy } },
          value: input.vote,
        },
      });
      if (!vote) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Failed creating Vote",
        });
      }
      return { id: vote.id };
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
