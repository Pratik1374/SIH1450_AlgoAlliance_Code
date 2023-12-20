import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { MdSend } from "react-icons/md";
import { useInput } from "../context/InputContext";
import FeatureBar from "../components/FeatureBar";
import { BsRobot } from "react-icons/bs";
import { CgProfile } from "react-icons/cg";
import Spinner from "../components/Spinner";
import { TbFileUpload } from "react-icons/tb";
import { useLocation } from "react-router-dom";
import axios from "axios";
import SidebarSpinner from "../components/SidebarSpinner";

const ChatbotChat = () => {
  const [chatHistory, setChatHistory] = useState([]);
  const [loadingAnswer, setLoadingAnswer] = useState(false);
  const [inputQuestion, setInputQuestion] = useState("");
  const [newChat, setNewChat] = useState(true);
  const location = useLocation();
  const email = localStorage.getItem("email");
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [documentsUploaded, setDocumentsUploaded] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [fileUploading, setFileUploading] = useState(false);

  useEffect(() => {
    const fetchUserHistory = async () => {
      try {
        // Split the pathname into components
        const pathComponents = location.pathname.split("/").filter(Boolean);
        const tab_name = pathComponents[pathComponents.length - 1];
        setLoadingHistory(true);
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/get_specific_tab_history`,
          {
            email,
            tab_name,
            chat_type: "chat-with-doc",
          }
        );

        const chatHistory = response?.data?.result;
        console.log("history ", chatHistory);
        setChatHistory(chatHistory);

        if (chatHistory.length > 0) {
          setNewChat(false);
        }
        setLoadingHistory(false);
      } catch (error) {
        console.error(error.message);
      } finally {
        setLoadingAnswer(false);
      }
    };

    fetchUserHistory();
  }, [location]);

  const handleSendClick = async () => {
    try {
      // Set loading state
      setLoadingAnswer(true);

      const pathComponents = location.pathname.split("/").filter(Boolean);
      const tab_name = pathComponents[pathComponents.length - 1];
      setLoadingHistory(true);
      const prompt = inputQuestion;
      console.log(selectedFileName);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/chat-with-doc`,
        {
          email,
          tab_name,
          chat_type: "chat-with-doc",
          prompt,
          file_name: selectedFileName,
        }
      );

      const answer = response?.data?.result;
      console.log(response?.data?.result);
      setInputQuestion("");

      if (inputQuestion) {
        setChatHistory((prevChats) => [
          ...prevChats,
          { query: inputQuestion, response: answer },
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

  const handleFileChange = async (event) => {
    try {
      const file = event.target.files[0];
      setSelectedFileName(file.name);
      setDocumentsUploaded(true);
      setFileUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/upload_doc_for_chat`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response?.data?.result) {
        alert("File Uploaded Successfully");
      }
    } catch (error) {
      console.error("Error fetching answer:", error);
    } finally {
      // Reset loading state
      setFileUploading(false);
      // Clear the inputQuestion state
    }
  };

  const handleIconClick = () => {
    // Trigger the file input when the icon is clicked
    document.getElementById("fileInput").click();
  };

  return (
    <section className="flex flex-col lg:flex-row text-white">
      <Sidebar />
      <div className="w-full p-2">
        <div className="w-full flex items-center justify-center mb-2 overflow-hidden">
          <FeatureBar />
        </div>
        {fileUploading ? (
          <div className="w-full h-full">
            <SidebarSpinner />
          </div>
        ) : (
          <>
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
                    <p className="ml-[40px]">{chat.query}</p>
                  </div>
                  <div className="flex w-[80vw] lg:w-[60vw] flex-col mt-1 mb-8 bg-[#080808] p-2 rounded-md shadow-md shadow-gray-800">
                    <div className="flex">
                      <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center overflow-hidden">
                        <BsRobot size={30} color="violet" />
                      </div>
                      <h2 className="ml-[10px] font-bold">Chatbot</h2>
                    </div>
                    <p className="ml-[40px] py-1">{chat.response}</p>
                  </div>
                </div>
              ))}

              {loadingHistory ? (
                <div className="w-full h-full">
                  <SidebarSpinner />
                </div>
              ) : (
                <></>
              )}

              {fileUploading ? (
                <div className="w-full h-full flex items-center justify-center flex-col">
                  <h2>Wait till file upload is complete...</h2>
                  <SidebarSpinner />
                </div>
              ) : (
                <></>
              )}

              {loadingAnswer ? (
                <div>
                  <div className="flex w-[60vw] flex-col p-2">
                    <div className="flex">
                      <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center overflow-hidden">
                        <CgProfile size={30} color="purple" />
                      </div>
                      <h2 className="ml-[10px] font-bold">You</h2>
                    </div>
                    <div>
                      <p className="ml-[40px]">{inputQuestion}</p>
                    </div>
                  </div>
                  <div className="flex w-[80vw] lg:w-[60vw] flex-col mt-1 mb-8 bg-[#080808] p-2 rounded-md shadow-md shadow-gray-800">
                    <div className="flex">
                      <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center overflow-hidden">
                        <BsRobot size={30} color="violet" />
                      </div>
                      <h2 className="ml-[10px] font-bold">Chatbot</h2>
                    </div>
                    <div>
                      <Spinner />
                    </div>
                  </div>
                </div>
              ) : (
                <></>
              )}
              {newChat ? (
                <>
                  <div className="absolute bottom-0 mt-2 left-0 lg:left-[16rem] right-0 flex items-center justify-center p-3 lg:-ml-11">
                    {loadingAnswer ? (
                      <>
                        <input
                          disabled
                          id="fileInput"
                          type="file"
                          accept=".pdf"
                          style={{ display: "none" }}
                          onChange={handleFileChange}
                        />
                      </>
                    ) : (
                      <>
                        {documentsUploaded ? (
                          <div className="rounded-lg px-3 py-1 bg-gray-800 w-[90vw] lg:w-[60vw] flex shadow-sm shadow-gray-100 relative items-center overflow-hidden">
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
                          </div>
                        ) : (
                          <>
                            <div
                              className="cursor-pointer pr-2 lg:-ml-10 flex flex-col justify-center items-center "
                              onClick={handleIconClick}
                            >
                              <p className="animate-bounce text-sm text-purple-300">
                                Upload File{" "}
                              </p>
                              <TbFileUpload size={30} color="violet" />
                            </div>
                            <input
                              id="fileInput"
                              multiple
                              type="file"
                              accept=".pdf"
                              style={{ display: "none" }}
                              onChange={handleFileChange}
                            />
                          </>
                        )}
                      </>
                    )}
                  </div>
                </>
              ) : (
                <></>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default ChatbotChat;
