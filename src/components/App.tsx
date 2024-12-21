"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNowPlaying } from "react-nowplaying";
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
import ChatHistory, { ConversationMessage } from "./Conversation";
import { FileUpload } from "./FileUpload";

enum UserType {
  Human = "Human",
  Bot = "Bot",
}

const App: React.FC = () => {
  const [caption, setCaption] = useState<string | undefined>(
    "Click to begin and start speaking"
  );

  const [user, setUser] = useState<UserType>(UserType.Human);
  const [llmText, setLLMText] = useState<string>("Thinking...");
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);

  const [context, setContext] = useState<AudioContext>();
  const { player, stop: stopAudio, play: playAudio } = useNowPlaying();

  const [uploadedFile, setUploadedFile] = React.useState<File | null>(null);

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

  const getTTS = async (text: string) => {
    stopAudio();

    const response = await fetch("/api/speak", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
      cache: "no-store",
    });
    stopAudio();

    const audioBlob = await response.blob();

    await playAudio(audioBlob, "audio/mp3");

    setLLMText(text);

    await new Promise<void>((resolve) => {
      player!.onended = () => resolve();
    });
  };

  const getLLMResponse = async (conv: ConversationMessage[]): Promise<void> => {
    const response = await fetch("/api/llm_response", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: fullTranscriptRef.current.trim(),
        full_conv: conv,
      }),
      cache: "no-store",
    });
    const result = await response.json();

    console.log("result.llm_response", result.llm_response);

    // BOT will speak the response
    setUser(UserType.Bot);
    await getTTS(result.llm_response);

    // Append bot response to conversation
    setConversation((prev) => [
      ...prev,
      {
        role: "assistant",
        content: result.llm_response,
        timestamp: new Date().toLocaleTimeString(),
        avatarUrl: "/bot.jpg",
        isSent: true,
      },
    ]);

    // Reset back to human
    setUser(UserType.Human);
    setLLMText("Thinking...");
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

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    console.log("File received:", file.name);
  };

  const handleSubmit = async () => {
    if (!uploadedFile) {
      console.log("No file uploaded");
      return;
    }

    console.log("File uploaded successfully");
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
        endpointing: 500,
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

      if (isFinal && speechFinal && fullTranscriptRef.current.trim() !== "") {
        console.log("Full Transcript:", fullTranscriptRef.current.trim());

        // Append human message to conversation
        setConversation((prev) => [
          ...prev,
          {
            role: "user",
            content: fullTranscriptRef.current.trim(),
            timestamp: new Date().toLocaleTimeString(),
            avatarUrl: "/human.jpg",
            isSent: true,
          },
        ]);

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
      const tempConv: ConversationMessage[] = [
        ...conversation,
        {
          role: "user",
          content: fullTranscriptRef.current.trim(),
          timestamp: new Date().toLocaleTimeString(),
          avatarUrl: "/human.jpg",
          isSent: true,
        },
      ];

      getLLMResponse(tempConv);
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
    <>
      <div className="flex flex-col items-center justify-center rounded ">
        <div className="container mx-auto p-4">
            <h1 className="text-xl font-bold mb-4 text-center">Please Upload Your Document</h1>
          <FileUpload onFileUpload={handleFileUpload} />
          {uploadedFile && (
            <div className="mt-4">
              <p>File ready to upload: {uploadedFile.name}</p>
              <Button onClick={handleSubmit} className="mt-2">
                Submit File
              </Button>
            </div>
          )}
        </div>
        <ChatHistory messages={conversation} />
        {caption && <TranscriptionBubble text={caption} />}
        <motion.div className="mt-4" animate={{}}>
          {user === UserType.Human ? (
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
          ) : (
            <TranscriptionBubble text={llmText}></TranscriptionBubble>
          )}
        </motion.div>
      </div>
    </>
  );
};

export default App;
