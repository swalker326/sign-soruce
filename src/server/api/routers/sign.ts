import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  privateProdedure,
  publicProcedure,
} from "~/server/api/trpc";

export const signRouter = createTRPCRouter({
  getSigns: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.sign.findMany({
      include: { word: { include: { images: true } } },
    });
  }),
  getSignWithVideoAndVotes: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.sign.findUnique({
        where: { id: input.id },
        include: { video: true },
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
  getSignById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const sign = await ctx.prisma.sign.findUnique({
        where: { id: input.id },
        include: { word: true, video: true },
      });
      if (!sign) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Sign not found" });
      }
      return sign;
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
  create: privateProdedure
    .input(
      z.object({
        wordId: z.string(),
        createdBy: z.string(),
        signDescription: z.string(),
        videoUrl: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const sign = await ctx.prisma.sign.create({
        data: {
          createdBy: input.createdBy,
          signDescription: input.signDescription || "",
          video: {
            create: {
              url: input.videoUrl,
              createdBy: input.createdBy,
              votes: {
                create: {
                  value: 1,
                  user: { connect: { id: input.createdBy } },
                },
              },
            },
          },
          word: {
            connect: { id: input.wordId },
          },
        },
      });
      return sign;
    }),
});
