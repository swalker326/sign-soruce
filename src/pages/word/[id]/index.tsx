import type { GetServerSideProps, GetStaticProps, NextPage } from "next";
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
import { Fragment } from "react";
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
import { getAuth } from "@clerk/nextjs/server";

const signWithVideoAndWord = Prisma.validator<Prisma.SignArgs>()({
  include: { video: true },
});

type SignWordVideos = Prisma.SignGetPayload<typeof signWithVideoAndWord>;

const SignVideos = ({ sign }: { sign: SignWordVideos }) => {
  const { data } = api.sign.getSignWithVideoAndVotes.useQuery({
    id: sign.id,
  });
  console.log(data);
  return (
    <div className="flex-1 flex-col rounded-lg bg-transparent">
      <Card>
        <CardHeader className="bg-gray-100">
          <div className="flex items-center justify-between px-20">
            <Button
              variant="outline"
              onClick={() => console.log("cast up vote")}
            >
              <ArrowBigUp className="h-6 w-6 text-purple-500" />
            </Button>
            <CardTitle>{23}</CardTitle>
            <Button
              variant="link"
              onClick={() => console.log("cast down vote")}
            >
              <ArrowBigDown className="h-6 w-6 text-red-500" />
            </Button>
          </div>
        </CardHeader>
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
  console.log("wordId", wordId);
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
            <Card>
              <CardHeader className="bg-purple-300">
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
            {/* <div className="mb-3 flex w-full flex-wrap space-x-1"> */}
            {[...data.signs, ...data.signs].map((sign) => (
              <SignVideos key={sign.id} sign={sign} />
            ))}
            {/* </div> */}
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
