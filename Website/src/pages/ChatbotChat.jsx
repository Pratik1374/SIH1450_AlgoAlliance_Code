import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { MdSend } from "react-icons/md";
import { useInput } from "../context/InputContext";
import FeatureBar from "../components/FeatureBar";
import { BsRobot } from "react-icons/bs";
import { CgProfile } from "react-icons/cg";
import Spinner from "../components/Spinner";

const ChatbotChat = () => {
  const [chatHistory, setChatHistory] = useState([]);
  const [loadingAnswer, setLoadingAnswer] = useState(false);
  const [inputQuestion, setInputQuestion] = useState("");

  useEffect(() => {
    // Dummy data for chat history
    const dummyChatHistory = [
      { question: "What is your name?", answer: "I am a chatbot." },
      {
        question: "How does the weather look today?",
        answer:
          "I don't have that information.Lorem ipsum dolor sit amet consectetur adipisicing elit. Eaque debitis, et earum velit dolorem quod modi quibusdam tempora fugiat voluptatum nam! Quo nobis iure sapiente animi sed porro cumque dolore.Lorem ipsum dolor sit amet consectetur adipisicing elit. Eaque debitis, et earum velit dolorem quod modi quibusdam tempora fugiat voluptatum nam! Quo nobis iure sapiente animi sed porro cumque dolore.",
      },
    ];
    setChatHistory(dummyChatHistory);

    // const fetchUserHistory = async () => {
    //   try {
    //     // Split the pathname into components
    //     const pathComponents = location.pathname.split("/").filter(Boolean);
    //     const tab_name = pathComponents[pathComponents.length - 1];

    //     console.log(tab_name);
    //     setLoadingHistory(true);
    //     const response = await axios.post(
    //       `${import.meta.env.VITE_API_URL}/get_specific_tab_history`,
    //       {
    //         email,
    //         tab_name,
    //         chat_type: "summarization",
    //       }
    //     );

    //     const chatHistory = response?.data?.result;
    //     console.log(chatHistory);
    //     setChatHistory(chatHistory);
    //     
    //   } catch (error) {
    //     console.error(error.message);
    //   }
    // };
    // fetchUserHistory();
  }, []);

  const handleSendClick = async () => {
    try {
      // Set loading state
      setLoadingAnswer(true);

      // Simulate fetching the answer (replace this with your actual logic)
      const answer = await fetchAnswerFromAPI(inputQuestion); 
      // Update currentAnswer with the actual answer

      await new Promise((resolve) => {
        setTimeout(() => {
          setLoadingAnswer(false);
          resolve();
        }, 3000);
      });

      setInputQuestion("");

      if (inputQuestion) {
        setChatHistory((prevChats) => [
          ...prevChats,
          { question: inputQuestion, answer: answer },
        ]);
      }
    } catch (error) {
      console.error("Error fetching answer:", error);
    } finally {
      // Reset loading state
      setLoadingAnswer(false);
      // Clear the inputQuestion state
      setInputQuestion("");
    }
  };

  const handleTextareaKeyDown = (e) => {
    // Check if the Enter key is pressed (key code 13) and Shift key is not pressed
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevents the default behavior of adding a new line
      handleSendClick(); // Trigger the send click event
    }
  };

  const fetchAnswerFromAPI = async (question) => {
    // Replace this with your actual API call to get the answer
    // For simplicity, returning a dummy answer here
    return "I don't know the answer yet.";
  };

  return (
    <section className="flex flex-col lg:flex-row text-white">
      <Sidebar />
      <div className="w-full p-2">
        <div className="w-full flex items-center justify-center mb-2 overflow-hidden">
          <FeatureBar />
        </div>
        <div className="w-full h-[65vh] lg:h-[70vh] pl-3 lg:p-9 pt-1 lg:pt-2 lg:pl-24 overflow-auto scrollbar-thin scrollbar-thumb-gray-500">
          {/* Display previous questions and answers */}
          {chatHistory.map((chat, index) => (
            <div key={index}>
              <div className="flex w-[80vw] lg:w-[60vw] flex-col p-2">
                <div className="flex">
                  <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center overflow-hidden">
                    <CgProfile size={30} color="purple" />
                  </div>
                  <h2 className="ml-[10px] font-bold">You</h2>
                </div>
                <p className="ml-[40px]">{chat.question}</p>
              </div>
              <div className="flex w-[80vw] lg:w-[60vw] flex-col mt-1 mb-8 bg-[#080808] p-2 rounded-md shadow-md shadow-gray-800">
                <div className="flex">
                  <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center overflow-hidden">
                    <BsRobot size={30} color="violet" />
                  </div>
                  <h2 className="ml-[10px] font-bold">Chatbot</h2>
                </div>
                <p className="ml-[40px] py-1">{chat.answer}</p>
              </div>
            </div>
          ))}

          {loadingAnswer ? (
            <div>
              <div className="flex w-[60vw] flex-col p-2">
                <div className="flex">
                  <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center overflow-hidden">
                    <CgProfile size={30} color="purple" />
                  </div>
                  <h2 className="ml-[10px] font-bold">You</h2>
                </div>
                <p className="ml-[40px]">{inputQuestion}</p>
              </div>
              <div className="flex w-[80vw] lg:w-[60vw] flex-col mt-1 mb-8 bg-[#080808] p-2 rounded-md shadow-md shadow-gray-800">
                <div className="flex">
                  <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center overflow-hidden">
                    <BsRobot size={30} color="violet" />
                  </div>
                  <h2 className="ml-[10px] font-bold">Chatbot</h2>
                </div>
                <div><Spinner/></div>
              </div>
            </div>
          ) : (
            <></>
          )}

          <div className="absolute bottom-0 my-2 left-0 lg:left-[16rem] right-0 flex items-center justify-center p-3 lg:-ml-11">
            <div className="rounded-lg px-3 py-1 bg-gray-800 w-[90vw] lg:w-[60vw] flex shadow-sm shadow-gray-100 relative items-center overflow-hidden">
              {loadingAnswer ? (
                <>
                  <div className="w-full bg-transparent h-[40px] max-h-[200px] focus:outline-none resize-none overflow-y-auto scrollbar-hidden items-center overflow-hidden translate-y-2 opacity-50">
                    Wait for response...
                  </div>
                  <button
                    disabled
                    className="w-[40px] h-[40px] p-1 lg:hover:bg-gray-700 rounded-full opacity-40"
                    onClick={handleSendClick}
                  >
                    <MdSend size={30} color="violet" />
                  </button>
                </>
              ) : (
                <>
                  <textarea
                    id="textarea"
                    placeholder="Enter your question here..."
                    className="w-full bg-transparent h-[40px] max-h-[200px] focus:outline-none resize-none overflow-y-auto scrollbar-hidden items-center overflow-hidden translate-y-2"
                    onChange={(e) => {
                      e.target.style.height = "auto";
                      e.target.style.height = `${e.target.scrollHeight}px`;
                      setInputQuestion(e.target.value);
                    }}
                    onKeyDown={handleTextareaKeyDown}
                    value={inputQuestion}
                  ></textarea>
                  <button
                    className="w-[40px] h-[40px] p-1 lg:hover:bg-gray-700 rounded-full "
                    onClick={handleSendClick}
                  >
                    <MdSend size={30} color="violet" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChatbotChat;
