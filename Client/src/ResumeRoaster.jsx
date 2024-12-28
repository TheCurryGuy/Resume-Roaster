import React, { useState } from "react";
import axios from "axios";
import "./ResumeRoaster.css"; // Optional for custom styling
import ReactMarkdown from "react-markdown"

const ResumeRoaster = () => {
  const [file, setFile] = useState(null);
  const [roast, setRoast] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setRoast("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a resume PDF file.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    try {
      setIsLoading(true);
      setError("");

      const response = await axios.post("http://localhost:3000/roast", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setRoast(response.data.roast);
    } catch (err) {
      setError(
        err.response?.data?.error || "Failed to generate resume roast. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="resume-roaster">
      <h1>Resume Roaster🔥🔥</h1>
      {!roast && <form onSubmit={handleSubmit} className="upload-form">
        <label>Upload your PDF Resume If You Dare!: ⚠️</label>
        <input
          type="file"
          id="resume"
          accept=".pdf"
          onChange={handleFileChange}
        />
        <label for="file">Alpha Ego Destruction Incoming! 💀</label>
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Roasting..." : "Roast My Resume"}
        </button>
      </form>}

      {error && <p className="error">Error: {error}</p>}

      {roast && (
        <div className="roast-result">
          <h2>BrainRot Roast Results 🔥💀</h2>
          <ReactMarkdown>{roast}</ReactMarkdown>
          <button onClick={()=>{setRoast(false)}}>Roast Another</button>
        </div>
      )}
    </div>
  );
};

export default ResumeRoaster;
