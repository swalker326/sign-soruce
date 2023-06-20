import { useClerk } from "@clerk/nextjs";
import { UploadDropzone } from "@uploadthing/react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { PageLayout } from "~/components/layout";
import type { OurFileRouter } from "~/server/uploadthing/router";
import { api } from "~/utils/api";
import "@uploadthing/react/styles.css";

export function WordImageAddForm() {
  const router = useRouter();
  const errors = [];
  const { user } = useClerk();
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const { id: wordId } = router.query;
  console.log(wordId, typeof wordId);
  const { mutate: wordImageCreateMutation } =
    api.word.addWordImage.useMutation();
  const {
    data: word,
    isError,
    isLoading,
  } = api.word.getWordById.useQuery({ id: wordId as string });
  const handleAddImage = () => {
    if (!imageUrl) {
      errors.push("No image url");
      throw new Error("No image url");
    }
    if (!user?.id) {
      errors.push("No user id");
      throw new Error("No user id");
    }
    wordImageCreateMutation({
      url: imageUrl,
      createdBy: user?.id,
      wordId: wordId as string,
    });
  };
  return (
    <PageLayout>
      <div className="w-full">
        <h1 className="text-4xl font-semibold">
          Add Image for &quot;{word?.word}&quot;
        </h1>
        {isError && (
          <div className="text-red-500">Error Adding image to word</div>
        )}
        <div className="flex max-w-full flex-col items-center">
          {imageUrl && (
            <Image src={imageUrl} width={300} height={300} alt="Image" />
          )}
          <UploadDropzone<OurFileRouter>
            endpoint="imageUploader"
            onClientUploadComplete={(res) => {
              // Do something with the response
              if (res && res.length > 0) {
                const imageUrl = res[0]?.fileUrl;
                setImageUrl(imageUrl);
              }
              toast.success("Image uploaded");
            }}
            onUploadError={(error: Error) => {
              toast.error(error.message);
            }}
          />
        </div>
        <div className="flex w-full justify-end">
          <button
            className="border-1.5 mt-2 rounded-lg border bg-purple-500 px-5 py-3 text-white focus:border-purple-900 focus:outline-none disabled:bg-gray-300"
            onClick={() => handleAddImage()}
            disabled={isLoading || !imageUrl}
          >
            Add Image
          </button>
        </div>
      </div>
    </PageLayout>
  );
}

export default WordImageAddForm;
