import { useEffect, useState } from "react";
import { useRef } from "react";
import { motion } from "framer-motion";
import { useMediaQuery } from "react-responsive";
import { MdMenu } from "react-icons/md";
import { FaPlus } from "react-icons/fa6";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import logo from "../../src/AlgoAlliance_logo.png";
import axios from "axios";
import { useAuth } from "../context/authContext";
import { CgProfile } from "react-icons/cg";
import SidebarSpinner from "./SidebarSpinner";

const Sidebar = () => {
  let isTabletMid = useMediaQuery({ query: "(max-width: 768px)" });
  const [open, setOpen] = useState(isTabletMid ? false : true);
  const sidebarRef = useRef();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const email = localStorage.getItem("email");

  const getFormattedDateTime = (datetimeString) => {
    // var datetimeString = "19335620231219668";

    // Extract individual components
    var year = datetimeString.substring(6, 10);
    var month = datetimeString.substring(10, 12);
    var day = datetimeString.substring(12, 14);
    var hours = datetimeString.substring(0, 2);
    var minutes = datetimeString.substring(2, 4);
    var seconds = datetimeString.substring(4, 6);

    var formattedstring = "Date: " + day + "/" + month + "/"+ year + " Time: " + hours + ":" + minutes + ":" + seconds;
      return formattedstring;
  };

  useEffect(() => {
    const fetchUserHistory = async () => {
      try {
        setLoadingHistory(true);
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/get_all_tab_history_items`,
          {
            email,
          }
        );

        const all_tabs = response?.data?.result;
        if (all_tabs) {
          setChats(all_tabs);
        }
        setLoadingHistory(false);
      } catch (error) {
        console.error(error.message);
      }
    };

    fetchUserHistory();
  }, []);

  useEffect(() => {
    if (isTabletMid) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  }, [isTabletMid]);

  useEffect(() => {
    isTabletMid && setOpen(false);
  }, [pathname]);

  const handleChatClick = (chatId, chat_type) => {
    // Programmatically navigate to the chat page
    navigate(`/${chat_type}/${chatId}`);
  };

  const handleNewChatClick = () => {
    navigate("/chat-with-doc");

    // Close the sidebar on mobile if it's open
    isTabletMid && setOpen(false);
  };

  const Nav_animation = isTabletMid
    ? {
        open: {
          x: 0,
          width: "16rem",
          transition: {
            damping: 40,
          },
        },
        closed: {
          x: -250,
          width: 0,
          transition: {
            damping: 40,
            delay: 0.15,
          },
        },
      }
    : {
        open: {
          width: "16rem",
          transition: {
            damping: 40,
          },
        },
        closed: {
          width: "4rem",
          transition: {
            damping: 40,
          },
        },
      };

  return (
    <div>
      <div
        onClick={() => setOpen(false)}
        className={`md:hidden fixed inset-0 max-h-screen z-[998] bg-black/50 ${
          open ? "block" : "hidden"
        } `}
      ></div>
      <motion.div
        ref={sidebarRef}
        variants={Nav_animation}
        initial={{ x: isTabletMid ? -250 : 0 }}
        animate={open ? "open" : "closed"}
        className=" bg-black text-white shadow-xl z-[999] max-w-[16rem]  w-[16rem] 
            overflow-hidden md:relative fixed
         h-screen "
      >
        <div className="mx-2 my-3 px-3 py-1">
          <img src={logo} alt="" />
        </div>
        <div className="my-4 flex items-center max-w-[16rem]  w-[16rem] justify-center ">
          <div className="flex items-center max-w-[12rem] w-[12rem] justify-around px-2 py-2 bg-purple-600 hover:opacity-90 rounded-full cursor-pointer">
            <FaPlus />
            <div
              className="flex justify-center items-center mr-[30px]"
              onClick={() => handleNewChatClick()}
            >
              <h2 className="font-bold text-lg">New Chat</h2>
            </div>
          </div>
        </div>
        {loadingHistory ? (
          <>
            <div className="flex flex-col h-[65vh] justify-center items-center">
              <SidebarSpinner />
            </div>
          </>
        ) : (
          <div className="flex flex-col h-[65vh] overflow-auto scrollbar-thin scrollbar-thumb-gray-500">
            {chats.map((chat, index) => (
              <NavLink
                key={index}
                to={`/${chat.chat_type}/${chat.tab_name}`}
                className="text-white no-underline"
              >
                <div
                  className={`flex rounded-md mx-2 p-2 max-h-10 h-10 my-1 cursor-pointer lg:hover:bg-gray-600 ${
                    window.location.pathname ===
                    `/${chat.chat_type}/${chat.tab_name}`
                      ? "bg-purple-500 lg:hover:bg-purple-500"
                      : "bg-gray-800"
                  }`}
                  onClick={() => handleChatClick(chat.tab_name, chat.chat_type)}
                >
                  <h1 className="truncate">
                    {getFormattedDateTime(chat.tab_name)}
                    
                  </h1>
                </div>
              </NavLink>
            ))}
          </div>
        )}

        <div className="flex items-center mt-auto absolute bottom-0 left-0  overflow-hidden my-1">
          <CgProfile size={40} color="purple" />
          <div className="overflow-hidden max-h-[50px] max-w-[140px]">
            <h1 className="ml-2 font-bold truncate">{email}myMail@mail.com</h1>
          </div>
        </div>
      </motion.div>
      <div className="m-3 md:hidden  " onClick={() => setOpen(true)}>
        <MdMenu size={25} />
      </div>
    </div>
  );
};

export default Sidebar;
