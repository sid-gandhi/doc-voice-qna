import React from "react";

const TranscriptionBubble = ({ text }: { text: string }) => {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="bg-gray-900/10 backdrop-blur-md px-8 py-4 rounded-lg border border-gray-200/20 shadow-lg max-w-2xl w-full text-center">
        <p className="text-lg font-medium text-gray-800">{text}</p>
      </div>
    </div>
  );
};

export default TranscriptionBubble;
