import type { Word } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/server/db";

const getWords = async (req: NextApiRequest, res: NextApiResponse) => {
  const words = await prisma.word.findMany();
  res.status(200).json(words);
};

const createWord = async (req: NextApiRequest, res: NextApiResponse) => {
  const { word, pronunciation, createdBy, definition } = req.body as Word;
  console.log(
    "word",
    word,
    "pronunciation",
    pronunciation,
    "createdBy",
    createdBy,
    "definition",
    definition
  );
  if (!word || !pronunciation || !createdBy || !definition) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  return res.status(200).json(
    await prisma.word.create({
      data: {
        word,
        definition,
        createdBy,
        pronunciation,
      },
    })
  );
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case "POST":
      return await createWord(req, res);
    case "GET":
      return await getWords(req, res);
    default:
      res.status(405).end();
  }

  const words = await prisma.word.findMany();
  res.status(200).json(words);
}
