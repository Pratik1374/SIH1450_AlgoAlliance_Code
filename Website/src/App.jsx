import { useState } from "react";
import "./App.css";
import { Route, Routes } from "react-router-dom";
import ChatbotHomepage from "./pages/ChatbotHomepage";
import SummarizationHomepage from "./pages/SummarizationHomepage";
import GrammarHomepage from "./pages/GrammarHomepage";
import ChatbotChat from "./pages/ChatbotChat";
import SummarizationChat from "./pages/SummarizationChat";
import GrammarChat from "./pages/GrammarChat";
import Homepage from "./pages/Homepage";
import ChatWithDocHomepage from "./pages/ChatwithdocHompage";
import ChatWithDocChat from "./pages/ChatwithdocChat";

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Homepage/>} />
        <Route path="/chatbot" element={<ChatbotHomepage />} />
        <Route path="/chatbot/:chatId" element={<ChatbotChat />} />
        <Route path="/summarization" element={<SummarizationHomepage />} />
        <Route path="/summarization/:chatId" element={<SummarizationChat />} />
        <Route path="/grammar" element={<GrammarHomepage />} />
        <Route path="/grammar/:chatId" element={<GrammarChat />} />
        <Route path="/chat-with-doc" element={<ChatWithDocHomepage />} />
        <Route path="/chat-with-doc/:chatId" element={<ChatWithDocChat />} />
      </Routes>
    </>
  );
}

export default App;
