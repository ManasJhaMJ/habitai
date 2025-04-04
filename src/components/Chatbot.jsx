import React, { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { MessageSquare, XCircle } from "lucide-react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const API_KEY = process.env.GEMINI_API_KEY;

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [suggestedQuestions, setSuggestedQuestions] = useState([
        "I want to learn an instrument",
        "What are the benefits time management?",
        "Can I reduce 5 kgs in a month?"
    ]);

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = "You are an expert in habit tracking and task management. Provide informative and concise answers in short. Dont use Markdown.";

    const sendMessage = async (userInput) => {
        if (!userInput.trim()) return;

        const userMessage = { text: userInput, sender: "user" };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {
            const result = await model.generateContent({
                contents: [
                    { role: "user", parts: [{ text: prompt }] },
                    { role: "user", parts: [{ text: userInput }] }
                ]
            });

            const responseText = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
                "I'm not sure. Could you clarify?";

            setMessages((prev) => [...prev, { text: responseText, sender: "bot" }]);

            // Generate follow-up questions
            generateFollowUpQuestions(userInput);
        } catch (error) {
            console.error("Error:", error);
            setMessages((prev) => [...prev, { text: "An error occurred. Please try again.", sender: "bot" }]);
        } finally {
            setLoading(false);
        }
    };

    const generateFollowUpQuestions = async (userInput) => {
        try {
            const result = await model.generateContent({
                contents: [
                    { role: "user", parts: [{ text: `Suggest 3 follow-up questions based on this query: ${userInput} and keep the question very short in length. dont provide anything else like a starting statement. Provide each question in a single line seperated by \n ` }] }
                ]
            });

            const followUpQuestions = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text?.split("\n").filter(q => q.trim());

            if (followUpQuestions && followUpQuestions.length > 0) {
                setSuggestedQuestions(followUpQuestions.slice(0, 3)); // Show only top 3 suggestions
            }
        } catch (error) {
            console.error("Error generating follow-up questions:", error);
        }
    };

    return (
        <div>
            {/* Floating Chatbot Button */}
            {!isOpen && (
                <button className="chatbot-icon" onClick={() => setIsOpen(true)}>
                    <MessageSquare size={40} />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="chatbot-window">
                    {/* Header */}
                    <div className="chatbot-header">
                        <h2>AI Chatbot</h2>
                        <button onClick={() => setIsOpen(false)} className="chatbot-close">
                            <XCircle size={20} />
                        </button>
                    </div>

                    {/* Chat Messages */}
                    <div className="chatbot-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`chat-message ${msg.sender}`}>
                                {msg.text}
                            </div>
                        ))}
                        {loading && <p className="chatbot-thinking">Thinking...</p>}
                    </div>

                    {/* Question Suggestions Slider */}
                    <div>
                        <div className="chatbot-slider">
                            <Slider dots={true} infinite={true} speed={500} slidesToShow={1} slidesToScroll={1}>
                                {suggestedQuestions.map((question, index) => (
                                    <div key={index} className="slider-item">
                                        <button onClick={() => sendMessage(question)}>{question}</button>
                                    </div>
                                ))}
                            </Slider>
                        </div>
                        {/* Input Field */}
                        <div className="chatbot-input">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about your habits / skills..."
                            />
                            <button onClick={() => sendMessage(input)}>Send</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chatbot;