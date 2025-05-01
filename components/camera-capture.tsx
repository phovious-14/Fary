import { useState, useRef, useEffect } from "react";
import { Camera, Video, StopCircle, CheckCircle } from "lucide-react";

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onCancel: () => void;
  autoPublish?: boolean;
}

export function CameraCapture({
  onCapture,
  onCancel,
  autoPublish = false,
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const successTimerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize camera
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: true,
        });

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsCameraActive(true);
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Could not access camera. Please check permissions.");
      }
    };

    startCamera();

    return () => {
      // Clean up camera stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      // Clear any timers
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current);
      }
    };
  }, []);

  // Handle recording start
  const startRecording = () => {
    if (!streamRef.current) return;

    // Reset chunks array
    chunksRef.current = [];

    // Create a new MediaRecorder with the stream
    const mediaRecorder = new MediaRecorder(streamRef.current, {
      mimeType: "video/webm;codecs=vp8,opus",
    });

    mediaRecorderRef.current = mediaRecorder;

    // Set up data available handler
    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        console.log("Data available:", e.data.size, "bytes");
        chunksRef.current.push(e.data);
      }
    };

    // Set up stop handler
    mediaRecorder.onstop = () => {
      console.log("MediaRecorder stopped, chunks:", chunksRef.current.length);

      if (chunksRef.current.length === 0) {
        console.error("No data chunks were recorded");
        setError("Recording failed. Please try again.");
        return;
      }

      setIsProcessing(true);

      // Create blob from chunks
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      console.log("Created blob:", blob.size, "bytes");

      if (blob.size === 0) {
        console.error("Created blob is empty");
        setError("Recording failed. Please try again.");
        return;
      }

      // Create file from blob
      const file = new File([blob], "recorded-video.webm", {
        type: "video/webm",
      });

      // Pass the file to the parent component
      onCapture(file);

      // Show success message briefly before closing
      setTimeout(() => {
        setIsProcessing(false);
        setIsSuccess(true);

        // Auto-close after showing success message
        successTimerRef.current = setTimeout(() => {
          onCancel();
        }, 1500);
      }, 1000);
    };

    // Start recording with a timeslice to ensure we get data chunks
    mediaRecorder.start(100); // Get data every 100ms
    setIsRecording(true);
    setRecordingTime(0);

    // Start timer to track recording duration
    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
  };

  // Handle recording stop
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      // Request data before stopping
      mediaRecorderRef.current.requestData();

      // Stop the recorder
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  // Format recording time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-black">
      {error ? (
        <div className="text-center text-red-500 p-4">
          <p>{error}</p>
          <button
            className="mt-4 px-4 py-2 bg-gray-800 rounded-lg text-white"
            onClick={onCancel}
          >
            Go Back
          </button>
        </div>
      ) : isSuccess ? (
        <div className="text-center text-white p-4">
          <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
          <p className="text-xl font-medium">Story Created!</p>
          <p className="text-sm opacity-80 mt-2">
            Your story has been published
          </p>
        </div>
      ) : isProcessing ? (
        <div className="text-center text-white p-4">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Processing your video...</p>
        </div>
      ) : (
        <>
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* Recording indicator */}
            {isRecording && (
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 px-3 py-1.5 rounded-full">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-white text-sm">
                  {formatTime(recordingTime)}
                </span>
              </div>
            )}

            {/* Cancel button */}
            <button
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white"
              onClick={onCancel}
            >
              <StopCircle className="h-5 w-5" />
            </button>

            {/* Record button */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center">
              <button
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isRecording ? "bg-red-500 scale-110" : "bg-white scale-100"
                }`}
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevent default behavior
                  startRecording();
                }}
                onMouseUp={(e) => {
                  e.preventDefault(); // Prevent default behavior
                  stopRecording();
                }}
                onTouchStart={(e) => {
                  e.preventDefault(); // Prevent default behavior
                  startRecording();
                }}
                onTouchEnd={(e) => {
                  e.preventDefault(); // Prevent default behavior
                  stopRecording();
                }}
              >
                {isRecording ? (
                  <div className="w-6 h-6 rounded-sm bg-white"></div>
                ) : (
                  <div className="w-12 h-12 rounded-full border-4 border-red-500"></div>
                )}
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="absolute bottom-24 left-0 right-0 text-center">
            <p className="text-white text-sm opacity-80">
              {isRecording ? "Release to stop recording" : "Hold to record"}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
