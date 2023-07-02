/* eslint-disable @typescript-eslint/no-misused-promises */
import { useClerk } from "@clerk/nextjs";
import { StopCircleIcon } from "@heroicons/react/20/solid";
import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type SetStateAction,
  type Dispatch,
} from "react";
import { LoaderIcon, toast } from "react-hot-toast";
// import { useLocalStorage } from "~/hooks/UseLocalStorage";
import { api } from "~/utils/api";
import { useUploadThing } from "~/utils/uploadThing";

const mimeType = "video/webm;codecs=vp9";

type VideoRecorderProps = {
  onVideoUpload: Dispatch<SetStateAction<string | undefined>>;
};

const VideoRecorder = ({ onVideoUpload }: VideoRecorderProps) => {
  const [permission, setPermission] = useState(false);
  const { user } = useClerk();
  const [previwingVideo, setPreviewingVideo] = useState<boolean>(false);
  const [videoUploading, setVideoUploading] = useState<boolean>(false);
  const [videoBlob, setVideoBlob] = useState<Blob | null>();
  const mediaRecorder = useRef<MediaRecorder>();
  const liveVideoFeed = useRef<HTMLVideoElement>(null);
  const [recordingStatus, setRecordingStatus] = useState<
    "not-recording" | "recording"
  >("not-recording");
  const [stream, setStream] = useState<MediaStream>();
  const [recordedVideo, setRecordedVideo] = useState<string | null>();

  const { mutate: signVideoMutation } = api.sign.createSignVideo.useMutation();

  const { startUpload } = useUploadThing({
    endpoint: "videoUploader",
    onClientUploadComplete: () => {
      alert("uploaded successfully!");
    },
    onUploadError: () => {
      alert("error occurred while uploading");
    },
  });

  const getCameraPermission = useCallback(async () => {
    setRecordedVideo(null);
    if ("MediaRecorder" in window) {
      try {
        const videoConstraints = {
          audio: false,
          video: true,
        };
        const audioConstraints = { audio: true };
        // create audio and video streams separately
        const audioStream = await navigator.mediaDevices.getUserMedia(
          audioConstraints
        );
        const videoStream = await navigator.mediaDevices.getUserMedia(
          videoConstraints
        );
        setPermission(true);
        //combine both audio and video streams
        const combinedStream = new MediaStream([
          ...videoStream.getVideoTracks(),
          ...audioStream.getAudioTracks(),
        ]);
        setStream(combinedStream);
        //set videostream to live feed player
        if (liveVideoFeed.current) {
          liveVideoFeed.current.srcObject = videoStream;
        }
      } catch (err) {
        //type narrow my error
        if (err instanceof DOMException) {
          if (err.name === "NotAllowedError") {
            toast.error("Camera Permission Denied", {
              position: "bottom-right",
              duration: 5000,
            });
          }
        }
      }
    } else {
      toast.error("The MediaRecorder API is not supported in your browser.", {
        position: "bottom-right",
        duration: 5000,
      });
    }
  }, []);

  const startRecording = useCallback(() => {
    if (!stream) {
      throw new Error("No stream");
    }

    setRecordingStatus("recording");

    const media = new MediaRecorder(stream, { mimeType });
    mediaRecorder.current = media;

    const localVideoChunks: Blob[] = [];

    mediaRecorder.current.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        localVideoChunks.push(event.data);
      }
    };

    mediaRecorder.current.onstop = () => {
      const videoBlob = new Blob(localVideoChunks, { type: mimeType });
      const videoUrl = URL.createObjectURL(videoBlob);
      console.log("V_URL", videoUrl);
      setRecordedVideo(videoUrl);
      setVideoBlob(videoBlob);
    };

    mediaRecorder.current.start();
  }, [stream]);

  const stopRecording = useCallback(() => {
    if (!mediaRecorder.current) {
      throw new Error("No media recorder");
    }
    console.log("STOPPING RECORDING");
    setRecordingStatus("not-recording");
    mediaRecorder.current.stop();
  }, []);

  useEffect(() => {
    getCameraPermission().catch((err) => {
      console.error(err);
      toast.error("Camera Permission Denied", {
        position: "bottom-right",
        duration: 5000,
      });
    });
  }, [getCameraPermission]);

  const uploadFile = useCallback(
    async (blob: Blob) => {
      setVideoUploading(true);
      const videoFile = new File([blob], "recordedVideo.webm", {
        type: mimeType,
      });
      const res = await startUpload([videoFile]);
      if (res && res.length > 0) {
        const videoUrl = res[0]?.fileUrl;
        if (!videoUrl || !user?.id) {
          throw new Error("No video url");
        }
        signVideoMutation({
          url: videoUrl,
          createdBy: user?.id,
        });
        if (onVideoUpload) {
          onVideoUpload(videoUrl);
        }
        setVideoUploading(false);
      }
    },
    [onVideoUpload, signVideoMutation, startUpload, user?.id]
  );

  return (
    <div>
      <main>
        {/* {!videoBlob ? ( */}
        <div className="relative flex w-1/2 border-purple-200 ">
          <div className="absolute bottom-0 z-10 flex w-full justify-center gap-3">
            {permission && recordingStatus === "not-recording" ? (
              <button
                className="mb-1 flex items-center rounded-md bg-red-500 px-4 py-2 text-white"
                onClick={startRecording}
              >
                Record
              </button>
            ) : null}

            {permission && recordingStatus === "recording" && (
              <button
                className=" mb-1 flex items-center rounded-md bg-red-500 px-4 py-2  text-white"
                onClick={stopRecording}
              >
                <StopCircleIcon className="h-5 w-5" />
              </button>
            )}
          </div>
          <video className="w-full" src="" ref={liveVideoFeed} autoPlay muted />
        </div>
        {/* ) : ( */}
        {recordedVideo && (
          <div className="relative flex w-full border border-red-500">
            <video className="w-full" src={recordedVideo} controls />
          </div>
        )}
        {videoBlob && (
          <div className="flex gap-1">
            <button
              className="border-1.5 mt-2 rounded-lg border border-purple-500 px-3 py-1 text-slate-700 hover:border-purple-700 hover:bg-purple-100 focus:outline-none"
              onClick={() => uploadFile(videoBlob)}
            >
              {videoUploading ? <LoaderIcon /> : "Use Video"}
            </button>
            <button
              className="border-1.5 mt-2 rounded-lg border border-purple-500 px-3 py-1 text-slate-700 hover:border-purple-700 hover:bg-purple-100 focus:outline-none"
              onClick={() => setVideoBlob(null)}
            >
              Record Again
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
export default VideoRecorder;
