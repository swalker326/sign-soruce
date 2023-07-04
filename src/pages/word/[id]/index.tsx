import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import { PageLayout } from "~/components/layout";
import {
  CameraIcon,
  ChevronDownIcon,
  HandRaisedIcon,
  PencilIcon,
} from "@heroicons/react/20/solid";
import Link from "next/link";
import { Menu, Transition } from "@headlessui/react";
import { Fragment, useMemo } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Prisma } from "@prisma/client";
import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { cn } from "~/lib/utils";

const signWithVideoAndWord = Prisma.validator<Prisma.SignArgs>()({
  include: { video: { include: { votes: true } } },
});

type SignWordVideos = Prisma.SignGetPayload<typeof signWithVideoAndWord>;

const SignVideoCard = ({ sign }: { sign: SignWordVideos }) => {
  const ctx = api.useContext();
  const userId = useAuth().userId;
  const userVoted = userId
    ? sign.video?.votes?.find((vote) => vote.userId === userId)
    : false;
  const { mutate } = api.video.vote.useMutation({
    onSuccess: async () => {
      await ctx.word.getWordById.refetch();
    },
  });
  const [up, down] = useMemo(() => {
    return (
      sign?.video?.votes?.reduce(
        (acc, vote) => {
          if (vote.value === -1) {
            return [acc[0], acc[1] + -1];
          } else if (vote.value === 1) {
            return [acc[0] + 1, acc[1] || 0];
          }
          return acc;
        },
        [0, 0]
      ) || [0, 0]
    );
  }, [sign]);

  const scoreString = useMemo(() => {
    const score = up + down;
    if (score === 0) {
      return "0";
    }
    return score > 0 ? `+${score}` : `${score}`;
  }, [up, down]);
  return (
    <div className="mb-2 w-full rounded-lg bg-transparent">
      <Card>
        <div className="relative">
          <div className=" absolute left-5 top-5 z-30 flex items-center space-x-4 ">
            <Button
              variant="outline"
              onClick={() => mutate({ videoId: sign.video?.id || "", vote: 1 })}
              className={cn(
                userVoted && userVoted.value === 1 && "bg-purple-300",
                "hover:bg-purple-300"
              )}
            >
              <ArrowBigUp className="h-6 w-6 text-purple-500" />
            </Button>
            <CardTitle>{scoreString}</CardTitle>
            <Button
              variant="outline"
              className={cn(
                userVoted && userVoted.value === -1 && "bg-red-300",
                " hover:bg-red-300"
              )}
              onClick={() =>
                mutate({ videoId: sign.video?.id || "", vote: -1 })
              }
            >
              <ArrowBigDown className="h-6 w-6 text-red-500" />
            </Button>
          </div>
        </div>
        <CardContent className="relative">
          <div className="flex flex-col pt-3">
            <video src={sign.video?.url} loop muted autoPlay />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

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
          <div className="flex flex-col gap-3">
            <Card className="rounded-lg">
              <CardHeader className="rounded-t-lg bg-purple-300">
                <div className="flex justify-between">
                  <CardTitle>{data.word}</CardTitle>
                  <Menu as="div" className="relative inline-block text-left">
                    <div>
                      <Menu.Button className="inline-flex w-full justify-center rounded-md bg-purple-500 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
                        <PencilIcon className="mr-2 h-5 w-5 text-white" />
                        <ChevronDownIcon
                          className="-mr-1 ml-2 h-5 w-5 text-white "
                          aria-hidden="true"
                        />
                      </Menu.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="px-1 py-1 ">
                          <Menu.Item>
                            {() => (
                              <Link href={`/sign/create?wordid=${wordId}`}>
                                <div className="flex items-center gap-0.5 rounded-lg p-1 text-purple-500 hover:bg-purple-500 hover:text-white">
                                  <HandRaisedIcon className="mr-2 h-7 w-7" />
                                  <span className="font-semibold">
                                    Add Sign
                                  </span>
                                </div>
                              </Link>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {() => (
                              <Link href={`/word/${data.id}/image/add`}>
                                <div className="flex items-center gap-0.5 rounded-lg p-1 text-purple-500 hover:bg-purple-500 hover:text-white">
                                  <CameraIcon className="mr-2 h-7 w-7" />
                                  <span className="font-semibold">
                                    Add Photo
                                  </span>
                                </div>
                              </Link>
                            )}
                          </Menu.Item>
                          {/* <Menu.Item>
                        {({ active }) => (
                          <button
                            className={`${
                              active
                                ? "bg-violet-500 text-white"
                                : "text-gray-900"
                            } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                          >
                            {active ? (
                              <DeleteActiveIcon
                                className="mr-2 h-5 w-5 text-violet-400"
                                aria-hidden="true"
                              />
                            ) : (
                              <DeleteInactiveIcon
                                className="mr-2 h-5 w-5 text-violet-400"
                                aria-hidden="true"
                              />
                            )}
                            Delete
                          </button>
                        )}
                      </Menu.Item> */}
                        </div>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
                <CardDescription>{data.pronunciation}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="my-2 flex justify-between">
                  <p>{data.definition}</p>
                  {data.images && (
                    <div>
                      <Image
                        src={data.images[0]?.url || ""}
                        height={300}
                        width={600}
                        alt={`sing image for ${data.word}`}
                      />{" "}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            <div className="columns-1 gap-x-2 md:columns-2">
              {data.signs
                .sort((a, b) => {
                  const aScore =
                    a.video?.votes?.reduce((acc, vote) => {
                      if (vote.value === -1) {
                        return acc - 1;
                      }
                      return acc + 1;
                    }, 0) || 0;
                  const bScore =
                    b.video?.votes?.reduce((acc, vote) => {
                      if (vote.value === -1) {
                        return acc - 1;
                      }
                      return acc + 1;
                    }, 0) || 0;
                  console.log(aScore, bScore);
                  return bScore - aScore;
                })
                .map((sign) => (
                  <SignVideoCard key={sign.id} sign={sign} />
                ))}
            </div>
          </div>
        )}
      </PageLayout>
    </>
  );
};

// eslint-disable-next-line @typescript-eslint/require-await
export const getServerSideProps: GetServerSideProps = async (context) => {
  return { props: { wordId: context.params?.id } };
};

//This is better, but broken when I added privateProcedure to the sign
// export const getStaticProps: GetStaticProps = async (context) => {
//   const userId =
//   const ssg = createServerSideHelpers({
//     router: appRouter,
//     ctx: { prisma, userId },
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
//       wordId: id,
//     },
//   };
// };

// export const getStaticPaths = () => {
//   return { paths: [], fallback: "blocking" };
// };

export default SignPage;
