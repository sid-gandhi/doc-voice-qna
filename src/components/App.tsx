"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import {
  LiveConnectionState,
  LiveTranscriptionEvent,
  LiveTranscriptionEvents,
  useDeepgram,
} from "@/context/DeepgramContextProvider";
import {
  MicrophoneEvents,
  MicrophoneState,
  useMicrophone,
} from "@/context/MicrophoneContextProvider";
import TranscriptionBubble from "./TranscriptBubble";

const App: React.FC = () => {
  const [caption, setCaption] = useState<string | undefined>(
    "Click to begin and start speaking"
  );

  const fullTranscriptRef = useRef<string>("");

  const { connection, connectToDeepgram, connectionState } = useDeepgram();
  const {
    setupMicrophone,
    microphone,
    startMicrophone,
    stopMicrophone,
    microphoneState,
  } = useMicrophone();

  const captionTimeout = useRef<any>(null);
  const keepAliveInterval = useRef<any>(null);

  const getLLMResponse = async (): Promise<void> => {
    const response = await fetch("/api/llm_response", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: fullTranscriptRef.current.trim() }),
      cache: "no-store",
    });
    const result = await response.json();

    console.log("result.llm_response", result.llm_response);

    fullTranscriptRef.current = "";

    startMicrophone();
  };

  const toggleCall = () => {
    if (microphoneState === MicrophoneState.Paused) {
      startMicrophone();
    } else if (microphoneState === MicrophoneState.Open) {
      stopMicrophone();
    } else setupMicrophone();
  };

  // if microphone is ready connect to deepgram
  useEffect(() => {
    if (microphoneState === MicrophoneState.Ready) {
      connectToDeepgram({
        model: "nova-2",
        interim_results: true,
        smart_format: true,
        filler_words: true,
        utterance_end_ms: 3000,
        endpointing: 300,
      });
    }
  }, [microphoneState]);

  useEffect(() => {
    if (!microphone || !connection) return;

    const onData = (e: BlobEvent) => {
      if (e.data.size > 0) {
        connection?.send(e.data);
      }
    };

    const onTranscript = (data: LiveTranscriptionEvent) => {
      const { is_final: isFinal, speech_final: speechFinal } = data;

      let thisCaption = data.channel.alternatives[0].transcript;

      const startTime = data.start;
      const duration = data.duration;

      console.log(
        `${startTime} - ${
          startTime + duration
        } is_final: ${isFinal}, speech_final: ${speechFinal}: caption: ${thisCaption}`
      );

      if (thisCaption !== "") {
        setCaption(thisCaption);
      }

      if (isFinal) {
        fullTranscriptRef.current += " " + thisCaption;
      }

      if (isFinal && speechFinal) {
        console.log("Full Transcript:", fullTranscriptRef.current.trim());

        stopMicrophone();

        clearTimeout(captionTimeout.current);
        setCaption(undefined);
        // captionTimeout.current = setTimeout(() => {
        //   setCaption(undefined);
        //   clearTimeout(captionTimeout.current);
        // }, 3000);
      }
    };

    if (connectionState === LiveConnectionState.OPEN) {
      connection.addListener(LiveTranscriptionEvents.Transcript, onTranscript);
      microphone.addEventListener(MicrophoneEvents.DataAvailable, onData);

      startMicrophone();
    }
    return () => {
      // prettier-ignore
      connection.removeListener(LiveTranscriptionEvents.Transcript, onTranscript);
      microphone.removeEventListener(MicrophoneEvents.DataAvailable, onData);
      clearTimeout(captionTimeout.current);
    };
  }, [connectionState]);

  useEffect(() => {
    if (
      microphoneState === MicrophoneState.Paused &&
      fullTranscriptRef.current.trim() !== ""
    ) {
      getLLMResponse();
    }
  }, [microphoneState]);

  useEffect(() => {
    if (!connection) return;

    if (
      microphoneState !== MicrophoneState.Open &&
      connectionState === LiveConnectionState.OPEN
    ) {
      connection.keepAlive();

      keepAliveInterval.current = setInterval(() => {
        connection.keepAlive();
      }, 10000);
    } else {
      clearInterval(keepAliveInterval.current);
    }

    return () => {
      clearInterval(keepAliveInterval.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [microphoneState, connectionState]);

  return (
    <div className="flex flex-col items-center justify-center rounded">
      {caption && <TranscriptionBubble text={caption} />}
      <motion.div className="mt-4" animate={{}}>
        <Button
          onClick={toggleCall}
          className="flex items-center justify-center w-12 h-12 rounded-full shadow-lg"
        >
          <AnimatePresence>
            <motion.div
              key="mic-icon"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              {microphoneState === MicrophoneState.Open ||
              microphoneState === MicrophoneState.Opening ? (
                <Mic />
              ) : (
                <MicOff />
              )}
            </motion.div>
          </AnimatePresence>
        </Button>
      </motion.div>
    </div>
  );
};

export default App;
