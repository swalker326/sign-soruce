import { UploadDropzone } from "@uploadthing/react";
import { PageLayout } from "~/components/layout";
import "@uploadthing/react/styles.css";
import type { OurFileRouter } from "~/server/uploadthing/router";
import { FormEvent, useState } from "react";
import { WordSelector } from "~/components/Words/WordSelector";
import { useClerk } from "@clerk/nextjs";
import { api } from "~/utils/api";

const CreateWordPage = () => {
  const [videoUrl, setVideoUrl] = useState<string | undefined>();
  const [selectedWord, setSelectedWord] = useState<{
    id: string;
    label: string;
  }>();
  const { user } = useClerk();
  const [signDescription, setSignDescription] = useState<string>("");
  const { data: signCreateData, mutate: signCreateMutation } =
    api.sign.create.useMutation();
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
              placeholder="Sign description"
              name="description"
              onChange={(e) => setSignDescription(e.target.value)}
              value={signDescription}
            ></textarea>
            <h3>Sign Video</h3>
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
          <button>Add Sign</button>
        </form>
      </div>
    </PageLayout>
  );
};

export default CreateWordPage;
