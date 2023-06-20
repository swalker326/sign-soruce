import { UserButton } from "@clerk/nextjs";
import { PlusIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import type { PropsWithChildren } from "react";

export const PageLayout = (props: PropsWithChildren) => {
  return (
    <main className="flex h-screen w-full flex-col items-center">
      <div className="flex h-28 w-full items-center justify-between bg-purple-500 px-6 py-2">
        <Link href="/">
          <h1 className="text-5xl font-semibold text-white">Signing Source</h1>
        </Link>
        <div className="flex items-center gap-3">
          <Link href={"/sign/create"} className="text-white">
            <PlusIcon className="h-8 w-8 font-bold" />
          </Link>
          <UserButton />
        </div>
      </div>
      <div className="container flex h-full flex-col items-center bg-gray-100 px-4 pt-4">
        {props.children}
      </div>
    </main>
  );
};
