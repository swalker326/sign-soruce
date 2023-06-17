import { UserButton } from "@clerk/nextjs";
import Head from "next/head";
import { api } from "~/utils/api";
import "@uploadthing/react/styles.css";
import { Prisma } from "@prisma/client";
import Link from "next/link";

const signWithWord = Prisma.validator<Prisma.SignArgs>()({
  include: { word: true },
});

type SignWithWord = Prisma.SignGetPayload<typeof signWithWord>;

function SignCard({ sign }: { sign: SignWithWord }) {
  return (
    <div className="relative flex h-60 w-72 flex-col rounded-lg bg-transparent">
      <Link href={`/sign/${sign.id}`}>
        <div
          className="absolute h-full w-full rounded-lg bg-cover bg-center opacity-40 transition-all duration-500 "
          style={{
            zIndex: 0,
            backgroundImage: `url(${sign.word.image})`,
          }}
        ></div>
        <div className=" z-2 absolute h-full w-full rounded-lg bg-transparent px-2 py-4 hover:bg-purple-500 hover:bg-opacity-80 transition-all duration-300 ease-in-out">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">{sign.word.word}</h2>
            <p>-</p>
            <h3>{sign.word.pronunciation}</h3>
          </div>
          <p>{sign.word.definition}</p>
        </div>
      </Link>
    </div>
  );
}

export default function Home() {
  const { data } = api.sign.getAll.useQuery();
  return (
    <>
      <Head>
        <title>Sign Source</title>
        <meta
          name="description"
          content="Sign Source is an open soruce/crowd source ASL dictionary"
        />
      </Head>
      <main className="container flex h-screen max-w-screen-2xl flex-col items-center ">
        <div className="flex h-28 w-full items-center justify-between bg-purple-500 px-6 py-2">
          <h1 className="text-5xl">Signing Source</h1>
          <UserButton />
        </div>
        <div className="max-w-screen container flex h-full flex-col items-center bg-gray-100">
          <div className="flex w-full flex-wrap gap-4 p-3">
            {data &&
              [...data, ...data, ...data, ...data, ...data].map((sign) => (
                <SignCard key={sign.id} sign={sign} />
              ))}
          </div>
        </div>
      </main>
    </>
  );
}
