import { UploadDropzone } from "@uploadthing/react";
import { PageLayout } from "~/components/layout";
import "@uploadthing/react/styles.css";
import type { OurFileRouter } from "~/server/uploadthing/router";
import { useState } from "react";
import { WordSelector } from "~/components/Words/WordSelector";
import { useClerk } from "@clerk/nextjs";
import { api } from "~/utils/api";
import { toast } from "react-hot-toast";
import { useRouter } from "next/router";

const CreateWordPage = () => {
  const [videoUrl, setVideoUrl] = useState<string | undefined>();
  const {
    query: { wordid },
  } = useRouter();
  const { data } = api.word.getWordById.useQuery({
    id: (wordid as string) || "",
  });
  const [selectedWord, setSelectedWord] = useState<
    | {
        id: string;
        label: string;
      }
    | undefined
  >({ id: (wordid as string) || "", label: data?.word || "" });

  const { user } = useClerk();
  const [signDescription, setSignDescription] = useState<string>("");
  const { mutate: signCreateMutation, isLoading: isCreatingSign } =
    api.sign.create.useMutation({
      onSuccess: () => {
        if (!selectedWord) {
          return;
        }
        toast.success(`Sign for the word "${selectedWord.label}" Added!`, {
          position: "bottom-right",
          duration: 5000,
        });
        setSelectedWord({ id: "", label: "" });
        setSignDescription("");
        setVideoUrl(undefined);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  const { data: signVideoData, mutate: signVideoMutation } =
    api.sign.createSignVideo.useMutation();

  const createSign = () => {
    if (!signVideoData?.id) {
      throw new Error("No sign video id");
    }
    if (!user?.id) {
      throw new Error("No user id");
    }
    if (!signDescription) {
      throw new Error("No sign description");
    }
    if (!selectedWord?.id) {
      throw new Error("No selected word id");
    }
    signCreateMutation({
      videoId: signVideoData.id,
      createdBy: user?.id,
      wordId: selectedWord?.id,
      signDescription: signDescription,
    });
  };
  return (
    <PageLayout>
      <div className="w-full px-4">
        <h1 className="text-2xl">Create a Sign</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createSign();
          }}
        >
          <div className="flex w-1/2 flex-col gap-3">
            <WordSelector
              selected={selectedWord}
              setSelected={setSelectedWord}
            />
            <textarea
              style={{ resize: "none" }}
              className="rounded-lg  p-2 shadow-[0_0_0_1.5px_rgb(255,255,255)] outline-none focus:shadow-[0_0_0_1.5px_rgb(168,85,247)]"
              placeholder="Sign description ie: Dominant hand slaps the thigh, then the fingers snap."
              rows={5}
              name="description"
              onChange={(e) => setSignDescription(e.target.value)}
              value={signDescription}
            ></textarea>
            <h3 className="text-xl font-semibold">Sign Video</h3>
            {videoUrl ? (
              <video src={videoUrl} controls loop />
            ) : (
              <UploadDropzone<OurFileRouter>
                endpoint="videoUploader"
                onClientUploadComplete={(res) => {
                  // Do something with the response
                  if (res && res.length > 0) {
                    const videoUrl = res[0]?.fileUrl;
                    if (!videoUrl || !user?.id) {
                      throw new Error("No video url");
                    }
                    setVideoUrl(videoUrl);
                    signVideoMutation({
                      url: videoUrl,
                      createdBy: user?.id,
                    });
                  }
                }}
                onUploadError={(error: Error) => {
                  alert(`ERROR! ${error.message}`);
                }}
              />
            )}
          </div>
          <button
            className="border-1.5 mt-2 rounded-lg border bg-purple-500 px-5 py-3 text-white focus:border-purple-900 focus:outline-none"
            disabled={isCreatingSign}
          >
            Add Sign
          </button>
        </form>
      </div>
    </PageLayout>
  );
};

export default CreateWordPage;
