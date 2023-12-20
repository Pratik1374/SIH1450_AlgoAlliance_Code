import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const FeatureBar = () => {
  const location = useLocation();
  const [selectedButton, setSelectedButton] = useState("");

  useEffect(() => {
    const path = location.pathname;
    // Extract the button name from the path and set the selected button
    const buttonName = path.split("/").filter(Boolean)[0];
    setSelectedButton(buttonName);
  }, [location.pathname]);

  const handleButtonClick = (buttonName) => {
    setSelectedButton(buttonName);
  };

  return (
    <div className="text-white">
      <div className="grid grid-cols-1 h-[60px] lg:h-18 w-[90vw] lg:w-[15rem] bg-gray-800 rounded-lg mx-auto text-center items-center px-2 ">
        {/* <Link
          to="/chatbot"
          className={`capitalize text-sm lg:text-lg lg:hover:bg-gray-700 rounded-lg ${
            selectedButton === "chatbot" ? "bg-purple-500 rounded-lg lg:hover:bg-purple-500" : ""
          }`}
          onClick={() => handleButtonClick("chatbot")}
        >
          Chat with ChatBot
        </Link> */}
        {/* <Link
          to="/summarization"
          className={`capitalize text-sm lg:text-lg lg:hover:bg-gray-700 rounded-lg ${
            selectedButton === "summarization" ? "bg-purple-500 rounded-lg lg:hover:bg-purple-500" : ""
          }`}
          onClick={() => handleButtonClick("summarization")}
        >
          Summarize  document
        </Link> */}
        {/* <Link
          to="/grammar"
          className={`capitalize text-sm lg:text-lg lg:hover:bg-gray-700 rounded-lg ${
            selectedButton === "grammar" ? "bg-purple-500 rounded-lg lg:hover:bg-purple-500" : ""
          }`}
          onClick={() => handleButtonClick("grammar")}
        >
          Grammar Correction
        </Link> */}
        <Link
          to="/chat-with-doc"
          className={`capitalize text-sm lg:text-lg lg:hover:bg-gray-700 rounded-lg ${
            selectedButton === "chat-with-doc" ? "bg-purple-500 rounded-lg lg:hover:bg-purple-500" : ""
          }`}
          onClick={() => handleButtonClick("another-route")}
        >
          Chat With Documents
        </Link>
      </div>
    </div>
  );
};

export default FeatureBar;
