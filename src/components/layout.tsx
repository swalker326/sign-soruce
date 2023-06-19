import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import type { PropsWithChildren } from "react";

export const PageLayout = (props: PropsWithChildren) => {
  return (
    <main className="container flex h-screen max-w-screen-2xl flex-col items-center ">
      <div className="flex h-28 w-full items-center justify-between bg-purple-500 px-6 py-2">
        <Link href="/">
          <h1 className="text-5xl">Signing Source</h1>
        </Link>
        <div>
          <Link href={"/sign/create"}>Create</Link>
          <UserButton />
        </div>
      </div>
      <div className="max-w-screen container flex h-full flex-col items-center bg-gray-100">
        {props.children}
      </div>
    </main>
  );
};
