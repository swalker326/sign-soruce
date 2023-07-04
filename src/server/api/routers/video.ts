import { TRPCError } from "@trpc/server";
import { string, z } from "zod";
import {
  createTRPCRouter,
  privateProdedure,
  publicProcedure,
} from "~/server/api/trpc";

export const videoRouter = createTRPCRouter({
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
  vote: privateProdedure
    .input(z.object({ videoId: string(), vote: z.number().min(-1).max(1) }))
    .mutation(async ({ ctx, input }) => {
      //handle the case where the user has already voted on this video
      const existingVote = await ctx.prisma.vote.findFirst({
        where: {
          video: { id: input.videoId },
          userId: ctx.userId,
        },
      });
      if (existingVote) {
        if (existingVote.value === input.vote) {
          await ctx.prisma.vote.delete({ where: { id: existingVote.id } });
          return { id: existingVote.id };
        } else {
          await ctx.prisma.vote.update({
            where: { id: existingVote.id },
            data: { value: input.vote },
          });
          return { id: existingVote.id };
        }
      }
      const vote = await ctx.prisma.vote.create({
        data: {
          video: { connect: { id: input.videoId } },
          user: { connect: { id: ctx.userId } },
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
});
