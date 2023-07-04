import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";

const SignPage: NextPage<{ signId: string }> = ({ signId }) => {
  const { data } = api.sign.getSignById.useQuery({
    id: signId,
  });

  if (!data) {
    return <div>Sign not found</div>;
  }
  return (
    <>
      <Head>
        <title>Sign Source - {data.word.word}</title>
        <meta
          name="description"
          content="Sign Source is an open soruce, crowd sourced ASL dictionary"
        />
      </Head>
      <PageLayout>
        {data && (
          <div>
            <h1>{data.word.word}</h1>
            <video src={data.video?.url} controls loop autoPlay muted />
          </div>
        )}
      </PageLayout>
    </>
  );
};

import { createServerSideHelpers } from "@trpc/react-query/server";
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import superjson from "superjson";
import { PageLayout } from "~/components/layout";

// export const getStaticProps: GetStaticProps = async (context) => {
//   const ssg = createServerSideHelpers({
//     router: appRouter,
//     ctx: { prisma,  },
//     transformer: superjson, // optional - adds superjson serialization
//   });
//   const id = context.params?.id;
//   if (typeof id !== "string") {
//     throw new Error("Invalid ID");
//   }
//   await ssg.sign.getSignById.prefetch({ id });
//   return {
//     props: {
//       trpcState: ssg.dehydrate(),
//       signId: id,
//     },
//   };
// };

// export const getStaticPaths = () => {
//   return { paths: [], fallback: "blocking" };
// };

export default SignPage;
