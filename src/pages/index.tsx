import { UserButton } from "@clerk/nextjs";
import Head from "next/head";
// import { api } from "~/utils/api";
import "@uploadthing/react/styles.css";

export default function Home() {
  // const hello = api.example.hello.useQuery({ text: "from tRPC" });

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
      </main>
    </>
  );
}
