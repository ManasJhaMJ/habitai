import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY } from "../geminiConfig";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export async function generateRoadmap(skill) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Generate a skill learning roadmap for ${skill} using correct Mermaid.js syntax. 
    Make sure to add the A, B, C, D etc type code.
    Keep the roadmap simple and short.
    ONLY give me the mermaid code and nothing else.
    -Example = 
    graph LR
subgraph Intro
    A[Intro to the Guitar] --> B[Tuning and Basic Chords]
end

subgraph Chords
    B[Tuning and Basic Chords] --> C[Major and Minor Chords] --> D[Seventh Chords] --> E[Barre Chords] --> F[Advanced Chords]
end

subgraph Scales and Exercises
    C[Major and Minor Chords] --> G[Major and Minor Scales] --> H[Arpeggios] --> I[Fingerpicking Exercises] --> J[Lead Guitar Techniques]
end

subgraph Songs and Techniques
    D[Seventh Chords] --> K[Beginner Songs] --> L[Intermediate Songs] --> M[Advanced Songs] --> N[Performance Techniques]
end
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let roadmap = response.text();

    // ✅ Remove Markdown backticks if Gemini mistakenly adds them
    roadmap = roadmap.replace(/```(mermaid)?/g, "").trim();
    roadmap = roadmap.replace(/```?/g, "").trim();

    console.log(roadmap);

    return roadmap;
  } catch (error) {
    console.error("Error generating roadmap:", error);
    return null;
  }
}