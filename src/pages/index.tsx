import { UserButton } from "@clerk/nextjs";
import Head from "next/head";
import { api } from "~/utils/api";
import "@uploadthing/react/styles.css";
import Image from "next/image";

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
      <main className="flex min-h-screen flex-col bg-white">
        <div className="flex items-center justify-between px-6 py-2">
          <h1 className="text-5xl">Signing Source</h1>
          <UserButton />
        </div>
        {data?.map((sign) => (
          <div
            key={sign.id}
            className="flex flex-col items-center justify-center"
          >
            <h2 className="text-2xl">{sign.word.word}</h2>
            <Image
              src={sign.word.image}
              alt={sign.word.definition}
              width={100}
              height={100}
            />
          </div>
        ))}
      </main>
    </>
  );
}
