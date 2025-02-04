import { useState, useRef } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { UploadCloud, CheckCircle, XCircle } from "lucide-react";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null); // Reference to reset input

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];

    if (selectedFile) {
      if (selectedFile.type !== "text/csv") {
        setMessage("Only CSV files are allowed!");
        return;
      }

      if (selectedFile.size > MAX_FILE_SIZE) {
        setMessage("File size exceeds 5MB limit!");
        return;
      }

      setFile(selectedFile);
      setMessage(""); // Clear previous errors
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file first!");
      return;
    }

    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post<{ message: string,success: boolean }>(
        "http://localhost:9000/api/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (event) => {
            const percent = Math.round((event.loaded * 100) / (event.total || 1));
            setProgress(percent);
          },
        }
      );
      if (!res.data.success) {
        setMessage(res.data.message);
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      setMessage(res.data.message);
      setFile(null);
      setProgress(100);

      // Reset input field
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: unknown) {
      setMessage("Upload failed. Please try again.");
      console.error("Upload Error:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];

    if (droppedFile) {
      if (droppedFile.type !== "text/csv") {
        setMessage("Only CSV files are allowed!");
        return;
      }

      if (droppedFile.size > MAX_FILE_SIZE) {
        setMessage("File size exceeds 5MB limit!");
        return;
      }

      setFile(droppedFile);
      setMessage("");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <Card className="p-6 w-full max-w-md shadow-lg">
        <CardContent className="flex flex-col items-center">
          <Label className="text-lg font-semibold">Upload CSV File</Label>

          {/* Drag & Drop */}
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg w-full p-6 mt-4 text-center bg-gray-50 hover:bg-gray-100 transition cursor-pointer"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <UploadCloud className="mx-auto text-gray-400 h-10 w-10" />
            <p className="text-gray-600 mt-2">Drag & drop your CSV file here</p>
            <Input
              ref={fileInputRef}
              type="file"
              className="hidden"
              id="file"
              accept=".csv"
              onChange={handleFileChange}
            />
            <label
              htmlFor="file"
              className="inline-block bg-blue-500 text-white px-4 py-2 rounded-lg mt-4 cursor-pointer hover:bg-blue-600"
            >
              Browse File
            </label>
          </div>

          {/* Show Selected File */}
          {file && (
            <p className="mt-4 text-gray-700">
              <span className="font-semibold">Selected:</span> {file.name}
            </p>
          )}

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            className="mt-4 w-full"
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Upload"}
          </Button>

          {/* Progress Bar */}
          {uploading && <Progress value={progress} className="mt-4 w-full" />}

          {/* Message */}
          {message && (
            <div
              className={`mt-4 flex items-center ${
                message.includes("failed") || message.includes("Please select") || message.includes("allowed") || message.includes("exceeds") || message.includes("Error")
                  ? "text-red-500"
                  : "text-green-500"
              }`}
            >
              {message.includes("failed") || message.includes("Please select") || message.includes("allowed") || message.includes("exceeds") ? (
                <XCircle className="h-5 w-5 mr-2" />
              ) : (
                <CheckCircle className="h-5 w-5 mr-2" />
              )}
              {message}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default App;
