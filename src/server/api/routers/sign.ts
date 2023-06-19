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
  getSigns: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.sign.findMany({
      include: { word: { include: { image: true } } },
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
        include: { word: true, videos: true },
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
      const signVideo = await ctx.prisma.signVideo.create({
        data: {
          url: input.url,
          upvotes: 0,
          downvotes: 0,
          createdBy: input.createdBy,
        },
      });
      if (!signVideo) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Failed creating Sign Video",
        });
      }
      return { id: signVideo.id };
    }),
  create: publicProcedure
    .input(
      z.object({
        wordId: z.string(),
        createdBy: z.string(),
        signDescription: z.string(),
        videoId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const sign = await ctx.prisma.sign.create({
        data: {
          createdBy: input.createdBy,
          wordId: input.wordId,
          signDescription: input.signDescription || "",
          videos: {
            connect: { id: input.videoId },
          },
        },
      });
      return sign;
    }),
});
