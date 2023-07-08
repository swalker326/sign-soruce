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
import { Controller, useForm } from "react-hook-form";
import { DevTool } from "@hookform/devtools";

type Inputs = {
  imageUrl: string;
};

export function WordImageAddForm() {
  const router = useRouter();
  const { user } = useClerk();
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const { id: wordId } = router.query;
  const { mutate: wordImageCreateMutation } =
    api.word.addWordImage.useMutation();

  const {
    data: word,
    isError,
    isLoading,
  } = api.word.getWordById.useQuery({ id: wordId as string });

  const { handleSubmit, control } = useForm<Inputs>({
    defaultValues: { imageUrl: "" },
  });
  if (!user) {
    return <div>Not logged in</div>;
  }
  if (!word) {
    return <div>Word not found</div>;
  }
  const handleAddImage = (values: Inputs) => {
    wordImageCreateMutation({
      url: values.imageUrl,
      createdBy: user.id,
      wordId: wordId as string,
    });
    toast.success(`Image for the word "${word.word}" Added!`, {
      position: "bottom-right",
      duration: 5000,
    });
  };
  return (
    <PageLayout>
      <DevTool control={control} />
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
          <form
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onSubmit={handleSubmit(handleAddImage)}
          >
            <Controller
              name="imageUrl"
              control={control}
              render={({ field }) => (
                <UploadDropzone<OurFileRouter>
                  endpoint="imageUploader"
                  onClientUploadComplete={(res) => {
                    if (res && res.length > 0 && res[0]?.fileUrl) {
                      const imageUrl = res[0].fileUrl;
                      setImageUrl(imageUrl);
                      field.onChange(imageUrl);
                    }
                  }}
                  onUploadError={(error: Error) => {
                    console.log("error", error);
                    toast.error(error.message);
                  }}
                />
              )}
            />

            <div className="flex w-full justify-end">
              <button
                type="submit"
                className="border-1.5 mt-2 rounded-lg border bg-purple-500 px-5 py-3 text-white focus:border-purple-900 focus:outline-none disabled:bg-gray-300"
                disabled={isLoading || !imageUrl}
              >
                Add Image
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageLayout>
  );
}

export default WordImageAddForm;
