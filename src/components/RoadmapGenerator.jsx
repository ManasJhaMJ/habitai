import React, { useState, useEffect } from "react";
import mermaid from "mermaid";
import { generateRoadmap } from "./Gemini";

export default function RoadmapGenerator() {
  const [skill, setSkill] = useState("");
  const [roadmap, setRoadmap] = useState("");

  useEffect(() => {
    mermaid.initialize({ startOnLoad: true }); // ✅ Ensures it loads on page start
  }, []);

  useEffect(() => {
    if (roadmap) {
      setTimeout(() => {
        mermaid.contentLoaded(); // ✅ Renders the updated Mermaid graph
      }, 100);
    }
  }, [roadmap]);

  const handleGenerate = async () => {
    setRoadmap("");

    const roadmapData = await generateRoadmap(skill);
    if (!roadmapData) {
      alert("Failed to generate roadmap. Try again.");
      return;
    }

    setRoadmap(roadmapData);
  };

  return (
    <div className="roadmap-container cyber-notification">
      <input
        type="text"
        value={skill}
        onChange={(e) => setSkill(e.target.value)}
        placeholder="Enter skill to learn"
      />
      <button onClick={handleGenerate}>Generate Roadmap</button>

      {roadmap && (
        <div className="mermaid">
          {roadmap} {/* ✅ Now correctly rendered as a graph */}
        </div>
      )}
    </div>
  );
}