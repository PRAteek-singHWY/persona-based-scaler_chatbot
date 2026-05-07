"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, 
  MessageSquare, 
  Send, 
  FileText, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  FileSearch,
  Sparkles,
  Zap,
  Info
} from "lucide-react";
import axios from "axios";

export default function Home() {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("idle"); // idle, uploading, indexing, success, error
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeSources, setActiveSources] = useState([]);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploadStatus("uploading");
    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploadStatus("indexing");
      const response = await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadStatus("success");
      setMessages([{
        role: "system",
        content: `Document "${file.name}" indexed successfully! You can now ask questions about it.`
      }]);
    } catch (error) {
      console.error(error);
      setUploadStatus("error");
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || uploadStatus !== "success") return;

    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await axios.post("/api/chat", { message: input });
      const aiMessage = { 
        role: "assistant", 
        content: response.data.answer,
        sources: response.data.sources 
      };
      setMessages(prev => [...prev, aiMessage]);
      setActiveSources(response.data.sources);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Sorry, I encountered an error while processing your request." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-8 flex flex-col items-center">
      <div className="bg-mesh"></div>
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-6xl flex justify-between items-center mb-12"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            NotebookLM RAG
          </h1>
        </div>
        <div className="hidden md:flex items-center gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <Zap className="w-3.5 h-3.5 text-yellow-500" />
            <span>Powered by GPT-4o</span>
          </div>
        </div>
      </motion.div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 flex-grow">
        
        {/* Left Column: Upload & Controls */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-4 flex flex-col gap-6"
        >
          <div className="glass-card p-6 flex flex-col gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-1">Source Document</h2>
              <p className="text-sm text-gray-400">Upload a PDF or Text file to start</p>
            </div>

            <div 
              className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all ${
                file ? "border-blue-500/50 bg-blue-500/5" : "border-white/10 hover:border-white/20 hover:bg-white/5"
              }`}
            >
              <input 
                type="file" 
                accept=".pdf,.txt" 
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {file ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="p-3 bg-blue-500/20 rounded-full">
                    <FileText className="w-8 h-8 text-blue-400" />
                  </div>
                  <span className="text-sm font-medium text-blue-300 max-w-[200px] truncate">{file.name}</span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setFile(null); setUploadStatus("idle"); }}
                    className="text-xs text-gray-500 hover:text-red-400 transition-colors"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="p-3 bg-white/5 rounded-full">
                    <Upload className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Click or drag file here</p>
                    <p className="text-xs text-gray-500 mt-1">PDF, TXT up to 10MB</p>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleUpload}
              disabled={!file || uploadStatus === "uploading" || uploadStatus === "indexing" || uploadStatus === "success"}
              className={`w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                uploadStatus === "success" 
                ? "bg-emerald-500/20 text-emerald-400 cursor-default"
                : !file || uploadStatus === "uploading" || uploadStatus === "indexing"
                ? "bg-white/5 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 active:scale-[0.98]"
              }`}
            >
              {uploadStatus === "uploading" ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Uploading...
                </>
              ) : uploadStatus === "indexing" ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Indexing Document...
                </>
              ) : uploadStatus === "success" ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Document Indexed
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Start Ingestion
                </>
              )}
            </button>

            {uploadStatus === "error" && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs">
                <AlertCircle className="w-4 h-4" />
                <span>Error processing document. Please try again.</span>
              </div>
            )}
          </div>

          {/* Guidelines Card */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-blue-400" />
              How it works
            </h3>
            <ul className="text-xs text-gray-400 space-y-3">
              <li className="flex gap-2">
                <span className="text-blue-500 font-bold">1.</span>
                <span>Upload any PDF or Text document you want to analyze.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-500 font-bold">2.</span>
                <span>Our system chunks and stores it in a Qdrant vector database.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-500 font-bold">3.</span>
                <span>Ask natural language questions and get grounded answers.</span>
              </li>
            </ul>
          </div>
        </motion.div>

        {/* Right Column: Chat Interface */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-8 flex flex-col glass-card overflow-hidden h-[75vh]"
        >
          {/* Chat Header */}
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-400" />
              <span className="font-semibold text-sm">Conversation</span>
            </div>
            {messages.length > 0 && (
              <button 
                onClick={() => setMessages([])}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                Clear Chat
              </button>
            )}
          </div>

          {/* Messages Area */}
          <div className="flex-grow overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                <div className="p-4 bg-white/5 rounded-full mb-4">
                  <FileSearch className="w-12 h-12" />
                </div>
                <p className="text-lg font-medium">Ready to analyze</p>
                <p className="text-sm">Your conversation will appear here</p>
              </div>
            ) : (
              messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] rounded-2xl p-4 ${
                    msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : msg.role === 'system'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-center w-full'
                    : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-none'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    
                    {/* Sources Mini-view */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap gap-2">
                        <span className="text-[10px] uppercase tracking-wider text-gray-500 w-full mb-1">Sources</span>
                        {msg.sources.slice(0, 3).map((source, idx) => (
                          <div key={idx} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] text-gray-400">
                            Page {source.metadata.loc?.pageNumber || idx + 1}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
            {isLoading && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="flex justify-start"
              >
                <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none p-4 flex gap-2 items-center">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                  <span className="text-sm text-gray-400">Thinking...</span>
                </div>
              </motion.div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-white/5 bg-white/[0.02]">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder={uploadStatus === "success" ? "Ask a question about the document..." : "Index a document first to start chatting"}
                disabled={uploadStatus !== "success" || isLoading}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 pr-12 text-sm focus:outline-none focus:border-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading || uploadStatus !== "success"}
                className="absolute right-2 p-2 text-blue-400 hover:text-blue-300 disabled:text-gray-600 transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[10px] text-center text-gray-500 mt-3 uppercase tracking-widest">
              Grounded AI Assistant • Built for Assignment 03
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
