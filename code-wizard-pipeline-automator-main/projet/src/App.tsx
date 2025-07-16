import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// ✅ Chatbot Icon Component that opens a URL
const ChatbotIcon = () => {
  const openChatbot = () => {
    window.open("http://localhost:8501/", "_blank"); // open in new tab
  };

  return (
    <div
      onClick={openChatbot}
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        width: 60,
        height: 60,
        backgroundColor: "#007bff",
        borderRadius: "50%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        cursor: "pointer",
        zIndex: 1000,
      }}
    >
      <img
        src="https://cdn-icons-png.flaticon.com/512/4712/4712027.png"
        alt="Chatbot"
        style={{ width: 30, height: 30 }}
      />
    </div>
  );
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        {/* ✅ Chatbot icon with link to localhost:8501 */}
        <ChatbotIcon />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
