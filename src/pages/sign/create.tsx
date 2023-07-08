import { UploadDropzone } from "@uploadthing/react";
import { PageLayout } from "~/components/layout";
import "@uploadthing/react/styles.css";
import type { OurFileRouter } from "~/server/uploadthing/router";
import { Fragment, useState } from "react";
import { WordSelector } from "~/components/Words/WordSelector";
import { useClerk } from "@clerk/nextjs";
import { api } from "~/utils/api";
import { toast } from "react-hot-toast";
import { useRouter } from "next/router";
import VideoRecorder from "~/components/Video/VideoRecorder";
import { Controller, type SubmitHandler, useForm } from "react-hook-form";
import { DevTool } from "@hookform/devtools";

export type CreateFormInputs = {
  description: string;
  videoUrl: string;
  word: string;
};

const CreateWordPage = () => {
  const [videoUrl, setVideoUrl] = useState<string | undefined>();
  const [videoSource, setVideoSource] = useState<"upload" | "record">("upload");
  const {
    query: { wordid },
  } = useRouter();
  const { data } = api.word.getWordById.useQuery({
    id: (wordid as string) || "",
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm({
    defaultValues: {
      description: "",
      videoUrl: "",
      word: (wordid as string) || "",
    },
  });
  const [selectedWord, setSelectedWord] = useState<
    | {
        id: string;
        label: string;
      }
    | undefined
  >({ id: (wordid as string) || "", label: data?.word || "" });

  const { user } = useClerk();
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
        setVideoUrl(undefined);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  const createSign: SubmitHandler<CreateFormInputs> = (values) => {
    if (!user?.id) {
      throw new Error("No user id");
    }
    signCreateMutation({
      videoUrl: values.videoUrl,
      createdBy: user?.id,
      wordId: values.word,
      signDescription: values.description,
    });
  };

  console.log(errors);

  return (
    <PageLayout>
      <DevTool control={control} />
      <div className="w-full px-4">
        <h1 className="text-2xl">Create a Sign</h1>
        <form
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onSubmit={handleSubmit(createSign)}
        >
          <div className="flex w-1/2 flex-col gap-3">
            <Controller
              name="word"
              control={control}
              rules={{ required: "Please select a word" }}
              render={({ field }) => (
                <WordSelector
                  {...field}
                  selected={selectedWord}
                  setSelected={setSelectedWord}
                  control={control}
                />
              )}
            />
            <textarea
              {...register("description", {
                required: "Please fill out a description",
              })}
              style={{ resize: "none" }}
              className="rounded-lg border border-purple-200  p-2 shadow-[0_0_0_1.5px_rgb(255,255,255)] outline-none focus:shadow-[0_0_0_1.5px_rgb(168,85,247)]"
              placeholder="Sign description ie: Dominant hand slaps the thigh, then the fingers snap."
              rows={5}
              name="description"
            />
            <p className="text-red-500">{errors.description?.message}</p>
            <div className="flex justify-between">
              <h3 className="text-xl font-semibold">Sign Video</h3>
              <button
                className="relative w-32 border text-sm text-gray-500"
                onClick={() => {
                  videoSource === "record"
                    ? setVideoSource("upload")
                    : setVideoSource("record");
                }}
              >
                {videoSource === "record" ? "Upload" : "Record"}
                {videoSource === "upload" && (
                  <em className=" absolute -bottom-2 right-0 text-xs">beta</em>
                )}
              </button>
            </div>
            {videoUrl ? (
              <video src={videoUrl} controls loop />
            ) : videoSource === "upload" ? (
              <Fragment>
                <Controller
                  name="videoUrl"
                  control={control}
                  rules={{ required: "Please upload a video" }}
                  render={({ field }) => (
                    <UploadDropzone<OurFileRouter>
                      {...field}
                      endpoint="videoUploader"
                      onClientUploadComplete={(res) => {
                        // Do something with the response
                        if (res && res.length > 0) {
                          const videoUrl = res[0]?.fileUrl;
                          if (!videoUrl || !user?.id) {
                            throw new Error("No video url");
                          }
                          setVideoUrl(videoUrl);
                          field.onChange(videoUrl);
                        }
                      }}
                      onUploadError={(error: Error) => {
                        toast.error(error.message);
                      }}
                    />
                  )}
                />
                <p className="text-red-500">{errors.videoUrl?.message}</p>
              </Fragment>
            ) : (
              <VideoRecorder onVideoUpload={setVideoUrl} />
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
