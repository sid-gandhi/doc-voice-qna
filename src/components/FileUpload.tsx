"use client";

import React, { useCallback, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, File, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onFileUpload: (file: File) => void;
}

export function FileUpload({ onFileUpload }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const { toast } = useToast();

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  }, []);

  const handleFile = (file: File) => {
    const validTypes = [".pdf", ".txt", ".docx"];
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();

    if (validTypes.includes(fileExtension)) {
      setFile(file);
      onFileUpload(file);
    } else {
      toast({
        variant: "destructive",
        title: "Error ingesting document",
        description: "Please upload a .pdf, .txt, .docx file",
      });

      return;
    }

    if (file.size > 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Error ingesting document",
        description: "File size must be less than 1MB",
      });
    }
  };

  const removeFile = useCallback(() => {
    setFile(null);
  }, []);

  return (
    <div
      className={`p-8 border-2 border-dashed rounded-lg ${
        dragActive ? "border-primary" : "border-gray-300"
      } transition-colors`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center space-y-4">
        <Upload className="w-12 h-12 text-gray-400" />
        <p className="text-lg font-semibold">Drag and drop your file here</p>
        <p className="text-sm text-gray-500">or</p>
        <Input
          id="file-upload"
          type="file"
          className="hidden"
          onChange={handleChange}
          accept=".pdf, .txt, .docx"
        />
        <Button
          variant="outline"
          className="cursor-pointer"
          onClick={() => document.getElementById("file-upload")?.click()}
        >
          Select a file
        </Button>
        <p className="text-xs text-gray-500">
          Supported file types: .pdf, .txt, .docx
        </p>
        <p className="text-xs text-gray-500">File size must be less than 1MB</p>
      </div>
      {file && (
        <div className="mt-4 p-4 bg-gray-100 rounded-md flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <File className="w-5 h-5" />
            <span className="text-sm font-medium">{file.name}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={removeFile}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
