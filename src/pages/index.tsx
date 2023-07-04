import { api } from "~/utils/api";
import "@uploadthing/react/styles.css";
import { Prisma } from "@prisma/client";
import Link from "next/link";
import { PageLayout } from "~/components/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { MoreHorizontalIcon } from "lucide-react";

const wordWithSigns = Prisma.validator<Prisma.WordArgs>()({
  include: { signs: { include: { video: true } } },
});

type WordWithSign = Prisma.WordGetPayload<typeof wordWithSigns>;

function WordCard({ word }: { word: WordWithSign }) {
  return (
    <div className="relative flex h-60 w-72 flex-col rounded-lg bg-transparent">
      <Card>
        <CardHeader className="bg-purple-300 duration-300 hover:bg-purple-400">
          <Link href={`/word/${word.id}`}>
            <CardTitle>{word.word}</CardTitle>
            <CardDescription>{word.pronunciation}</CardDescription>
          </Link>
        </CardHeader>
        <CardContent className="relative">
          <div className="flex flex-col pt-3">
            {word.signs.length > 0 ? (
              <video
                playsInline
                src={word.signs[0]?.video?.url}
                loop
                muted
                autoPlay
              />
            ) : (
              <p>{word.definition}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="mr-0 pb-3 pr-3">
          <div className="flex w-full items-center justify-end ">
            <Link
              href={`/word/${word.id}`}
              className="rounded-lg  p-2 shadow-md duration-300 ease-in-out hover:bg-purple-500 hover:text-gray-200"
            >
              <MoreHorizontalIcon className="" />
            </Link>
          </div>
        </CardFooter>
      </Card>
      {/* <Link href={`/word/${word.id}`}>
        <div
          className="absolute h-full w-full rounded-lg bg-cover bg-center opacity-40 transition-all duration-500 "
          style={{
            zIndex: 0,
            // backgroundImage: `url(${sign.word?.image?.url || ""})`,
          }}
        ></div>
        <div className=" z-2 absolute h-full w-full rounded-lg bg-transparent px-2 py-4 transition-all duration-300 ease-in-out hover:bg-purple-500 hover:bg-opacity-80">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">{word.word}</h2>
            <p>-</p>
            <h3>{word.pronunciation}</h3>
          </div>
          <p>{word.definition}</p>
        </div>
      </Link> */}
    </div>
  );
}

export default function Home() {
  const { data } = api.word.getAll.useQuery();
  return (
    <>
      <PageLayout>
        <div className="flex w-full flex-wrap gap-4 p-3">
          {data && data.map((word) => <WordCard key={word.id} word={word} />)}
        </div>
      </PageLayout>
    </>
  );
}
