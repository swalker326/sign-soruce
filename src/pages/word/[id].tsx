import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";

const SignPage: NextPage<{ wordId: string }> = ({ wordId }) => {
  const { data } = api.word.getWordById.useQuery({
    id: wordId,
  });

  if (!data) {
    return <div>Word not found</div>;
  }
  return (
    <>
      <Head>
        <title>Sign Source - {data.word}</title>
        <meta
          name="description"
          content="Sign Source is an open soruce, crowd sourced ASL dictionary"
        />
      </Head>
      <PageLayout>
        {data && (
          <div>
            <div className="mt-2 flex items-center justify-between">
              <h1>{data.word}</h1>
              <Link
                href={`/sign/create?selectedWord=${data.id}`}
                className="flex gap-2 rounded-lg border border-purple-500 px-3 py-3 hover:text-purple-800"
              >
                <PlusIcon className="h-6 w-6 font-semibold" /> <span>Sign</span>
              </Link>
            </div>
            <p>{data.definition}</p>
            {data.Signs.map((sign) => (
              <video
                key={sign.id}
                src={sign.videos[0]?.url}
                controls
                width="100%"
                height="auto"
              />
            ))}
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
import { PlusIcon } from "@heroicons/react/20/solid";
import Link from "next/link";

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
      wordId: id,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default SignPage;
