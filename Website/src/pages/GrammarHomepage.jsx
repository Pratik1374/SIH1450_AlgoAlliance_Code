import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { useInput } from "../context/InputContext";
import FeatureBar from "../components/FeatureBar";

const GrammarHomepage = () => {
  const navigate = useNavigate();
  const { inputValue, setInputValue } = useInput();

  const createNewChat = () => {
    // api call to create new chat will be made, and input query will be passed to ChatbotChat component, navigate to that chat page
    const num = parseInt(Math.random() * 100);
    console.log(num);

    // setInputValue("");

    // Pass the inputValue as a parameter to the next page
    navigate(`${num}`);
  };

  return (
    <section className="flex flex-col lg:flex-row text-white">
      <Sidebar />
      {/* Option bar will be here */}
      <div className="w-full p-2">
        <div className="w-full flex items-center justify-center h-[100px]">
          <FeatureBar/>
        </div>
        <div className="w-full h-[60vh] lg:h-[80vh] p-9 lg:pl-24 overflow-hidden">
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold font-serif shadow-sm ">
              Hello Learner,
            </h1>
            <p>Ask me anything...</p>
          </div>
          <div className="flex flex-wrap mt-4 gap-4 h-[50vh] lg:h-[50vh] overflow-auto ">
            <div className="flex flex-col p-4 items-start justify-center bg-gray-800 rounded-lg">
              <p className="my-3 text-lg font-bold">Analyze your documents</p>
              <p className="my-3">Lorem ipsum dolor sit amet consectetur </p>
              <p className="my-3">Lorem ipsum dolor sit amet consectetur </p>
              <p className="my-3">Lorem ipsum dolor sit amet consectetur </p>
            </div>
            <div className="flex flex-col p-4 items-start justify-center bg-gray-800 rounded-lg">
              <p className="my-3 text-lg font-bold">Analyze your documents</p>
              <p className="my-3">Lorem ipsum dolor sit amet consectetur </p>
              <p className="my-3">Lorem ipsum dolor sit amet consectetur </p>
              <p className="my-3">Lorem ipsum dolor sit amet consectetur </p>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 my-2 left-0 lg:left-[16rem] right-0 flex items-center justify-center p-3 -ml-11">
          <button
            className=" p-1 hover:opacity-80 rounded-full bg-purple-600 px-3"
            onClick={createNewChat}
          >
            Let's Chat
          </button>
        </div>
        {/* <div className="absolute bottom-0 my-2 left-0 lg:left-[16rem] right-0 flex items-center justify-center p-3 -ml-11">
          <div className="rounded-full px-3 py-1 bg-gray-800 w-[90vw] lg:w-[60vw] flex shadow-sm shadow-gray-100 relative items-center overflow-hidden">
            <textarea
              placeholder="Enter your question here..."
              className="w-full bg-transparent h-[40px] max-h-[200px] focus:outline-none resize-none overflow-y-auto scrollbar-hidden items-center overflow-hidden translate-y-2"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            ></textarea>
            <button
              className="w-[40px] h-[40px] p-1 hover:bg-gray-700 rounded-full "
              onClick={handleSendClick}
            >
              <MdSend size={30} color="violet" />
            </button>
          </div>
        </div> */}
      </div>
    </section>
  );
};

export default GrammarHomepage;
