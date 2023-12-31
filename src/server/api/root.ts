import { signRouter } from "~/server/api/routers/sign";
import { createTRPCRouter } from "~/server/api/trpc";
import { wordRouter } from "./routers/word";
import { videoRouter } from "./routers/video";
import { voteRouter } from "./routers/votes";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  sign: signRouter,
  word: wordRouter,
  video: videoRouter,
  votes: voteRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
