import { type GetStaticProps, type NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";

const SignPage: NextPage<{ signId: string }> = ({ signId }) => {
  const { data, isLoading } = api.sign.getSignById.useQuery({
    id: signId,
  });
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (!data) {
    return <div>Sign not found</div>;
  }
  return (
    <>
      <Head>
        <title>Sign Source - {data.word.word}</title>
        <meta
          name="description"
          content="Sign Source is an open soruce/crowd source ASL dictionary"
        />
      </Head>
      <main className="container flex h-screen max-w-screen-2xl flex-col items-center ">
        <div>{data.word.word}</div>
      </main>
    </>
  );
};

import { createServerSideHelpers } from "@trpc/react-query/server";
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import superjson from "superjson";

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx: { prisma },
    transformer: superjson, // optional - adds superjson serialization
  });
  const id = context.params?.id;
  if (typeof id !== "string") {
    throw new Error("Invalid ID");
  }
  await ssg.sign.getSignById.prefetch({ id });
  return {
    props: {
      trpcState: ssg.dehydrate(),
      signId: id,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default SignPage;
