import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import superjson from "superjson";
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
                              <span className="font-semibold">Add Sign</span>
                            </div>
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {() => (
                          <Link href={`/word/${data.id}/image/add`}>
                            <div className="flex items-center gap-0.5 rounded-lg p-1 text-purple-500 hover:bg-purple-500 hover:text-white">
                              <CameraIcon className="mr-2 h-7 w-7" />
                              <span className="font-semibold">Add Photo</span>
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
            <p>{data.definition}</p>
            {data.images && (
              <div>
                <Image
                  src={data.images[0]?.url || ""}
                  height={300}
                  width={300}
                  alt={`sing image for ${data.word}`}
                />{" "}
              </div>
            )}
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
