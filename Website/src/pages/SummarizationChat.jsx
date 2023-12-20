import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { MdSend } from "react-icons/md";
import { TbFileUpload } from "react-icons/tb";
import { useInput } from "../context/InputContext";
import FeatureBar from "../components/FeatureBar";
import { BsRobot } from "react-icons/bs";
import { CgProfile } from "react-icons/cg";
import Spinner from "../components/Spinner";
import { useAuth } from "../context/authContext";
import { useLocation } from "react-router-dom";
import axios from "axios";

const SummarizationChat = () => {
  const [chatHistory, setChatHistory] = useState([]);
  const [loadingAnswer, setLoadingAnswer] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const { user, setUser } = useAuth();
  const location = useLocation();
  const email = localStorage.getItem("email");
  const [loadingHistory,setLoadingHistory] = useState(false);

  useEffect(() => {
    const fetchUserHistory = async () => {
      try {
        // Split the pathname into components
        const pathComponents = location.pathname.split("/").filter(Boolean);
        const tab_name = pathComponents[pathComponents.length - 1];

        console.log(tab_name);
        setLoadingHistory(true);
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/get_specific_tab_history`,
          {
            email,
            tab_name,
            chat_type: "summarization",
          }
        );

        const chatHistory = response?.data?.result;
        console.log(chatHistory);
        setChatHistory(chatHistory);
        setLoadingHistory(false);
      } catch (error) {
        console.error(error.message);
      }
    };

    fetchUserHistory();
  }, [location]);

  const handleFileChange = async (event) => {
    try {
      const file = event.target.files[0];
      setSelectedFile(file);

      // Set loading state
      setLoadingAnswer(true);

      // Split the pathname into components
      const pathComponents = location.pathname.split("/").filter(Boolean);

      // Get the last route
      const tab_name = pathComponents[pathComponents.length - 1];
      console.log(tab_name);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("email", email); // Use user.email instead of the local variable email
      formData.append("tab_name", tab_name);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/document_summarization`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const answer = response?.data?.response;

      if (answer) {
        setChatHistory((prevChats) => [
          ...prevChats,
          { file_name: file.name, response: answer },
        ]);
      }
    } catch (error) {
      console.error("Error fetching answer:", error);
    } finally {
      // Reset loading state
      setLoadingAnswer(false);
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
        {loadingHistory ? (
          <>
            <div className="w-full h-[65vh] lg:h-[70vh] pl-3 lg:p-9 pt-1 lg:pt-2 lg:pl-24 ">
              <Spinner />
            </div>
          </>
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
                    <p className="ml-[40px]">Filename : {chat.file_name}</p>
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

              {loadingAnswer ? (
                <div>
                  <div className="flex w-[60vw] flex-col p-2">
                    <div className="flex">
                      <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center overflow-hidden">
                        <CgProfile size={30} color="purple" />
                      </div>
                      <h2 className="ml-[10px] font-bold">You</h2>
                    </div>
                    <p className="ml-[40px]">Filename : {selectedFile.name}</p>
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

              <div className="absolute bottom-0 mt-2 left-0 lg:left-[16rem] right-0 flex items-center justify-center p-3 lg:-ml-11">
                {loadingAnswer ? (
                  <>
                    <div
                      className="cursor-not-allowed pr-2 lg:-ml-10 opacity-40 flex flex-col justify-center items-center"
                      onClick={handleIconClick}
                    >
                      <TbFileUpload size={50} color="violet" />
                    </div>
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
                    <div
                      className="cursor-pointer pr-2 lg:-ml-10 flex flex-col justify-center items-center"
                      onClick={handleIconClick}
                    >
                      <p className="animate-bounce text-sm text-purple-300">
                        Upload File{" "}
                      </p>
                      <TbFileUpload size={50} color="violet" />
                    </div>
                    <input
                      id="fileInput"
                      type="file"
                      multiple
                      accept=".pdf"
                      style={{ display: "none" }}
                      onChange={handleFileChange}
                    />
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default SummarizationChat;
