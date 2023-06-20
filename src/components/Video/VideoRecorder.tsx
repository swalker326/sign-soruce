/* eslint-disable @typescript-eslint/no-misused-promises */
import {
  StopCircleIcon,
  VideoCameraIcon,
  ViewfinderCircleIcon,
} from "@heroicons/react/20/solid";
import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { useLocalStorage } from "~/hooks/UseLocalStorage";
const mimeType = "video/webm;codecs=vp9";
const VideoRecorder = () => {
  const [permission, setPermission] = useState(false);
  const mediaRecorder = useRef<MediaRecorder>();
  const liveVideoFeed = useRef<HTMLVideoElement>(null);
  const [recordingStatus, setRecordingStatus] = useState<
    "not-recording" | "recording"
  >("not-recording");
  const [stream, setStream] = useState<MediaStream>();
  const [videoChunks, setVideoChunks] = useState<any[]>([]);
  const [recordedVideo, setRecordedVideo] = useState<string | null>();
  const [permissionChecked, setPermissionChecked] = useLocalStorage(
    "camera-permission-checked",
    false
  );

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
            if (!permissionChecked) {
              setPermissionChecked(true);
              toast.error("Camera Permission Denied", {
                position: "bottom-right",
                duration: 5000,
              });
            }
          }
        }
      }
    } else {
      toast.error("The MediaRecorder API is not supported in your browser.", {
        position: "bottom-right",
        duration: 5000,
      });
    }
  }, [permissionChecked]);
  useEffect(() => {
    getCameraPermission().catch((err) => {
      console.log(err);
    });
  }, [getCameraPermission]);
  // eslint-disable-next-line @typescript-eslint/require-await
  const startRecording = async () => {
    setRecordingStatus("recording");
    if (!stream) {
      throw new Error("No stream");
    }
    const media = new MediaRecorder(stream, { mimeType });
    mediaRecorder.current = media;
    mediaRecorder.current.start();
    const localVideoChunks: any[] = [];
    mediaRecorder.current.ondataavailable = (event) => {
      if (typeof event.data === "undefined") return;
      if (event.data.size === 0) return;
      localVideoChunks.push(event.data);
    };
    setVideoChunks(localVideoChunks);
  };

  const stopRecording = () => {
    if (!mediaRecorder.current) {
      throw new Error("No media recorder");
    }
    setPermission(false);
    setRecordingStatus("not-recording");
    mediaRecorder.current.stop();
    mediaRecorder.current.onstop = () => {
      const videoBlob = new Blob(videoChunks, { type: mimeType });
      const videoUrl = URL.createObjectURL(videoBlob);
      setRecordedVideo(videoUrl);
      setVideoChunks([]);
    };
  };

  return (
    <div>
      <button
        className=" flex items-center gap-0.5 rounded-md bg-purple-500 px-4 py-2 text-white"
        onClick={getCameraPermission}
      >
        <VideoCameraIcon className="mr-2 h-5 w-5" />
        Record Video
      </button>
      <main>
        <div className="relative flex w-1/2 border border-red-500">
          <div className="absolute bottom-0 z-10 flex w-full justify-center gap-3">
            {permission && recordingStatus === "not-recording" ? (
              <button
                className="flex items-center rounded-md bg-red-500 px-4 py-2  text-white"
                onClick={startRecording}
              >
                <ViewfinderCircleIcon className="h-5 w-5" />
              </button>
            ) : null}

            <button
              className=" flex items-center rounded-md bg-red-500 px-4 py-2  text-white"
              onClick={stopRecording}
            >
              <StopCircleIcon className="h-5 w-5" />
            </button>
          </div>
          <video className="w-full" src="" ref={liveVideoFeed} autoPlay muted />
        </div>
        {recordedVideo && (
          <div className="relative flex w-1/2 border border-red-500">
            <div className="absolute flex w-full justify-end z-10">
              <a
                download
                className="flex items-center rounded-md bg-purple-500 px-4 py-2  text-white"
                href={recordedVideo || ""}
              >
                Download
              </a>
            </div>
            <video className="w-full" src={recordedVideo} controls />
          </div>
        )}
      </main>
    </div>
  );
};
export default VideoRecorder;
