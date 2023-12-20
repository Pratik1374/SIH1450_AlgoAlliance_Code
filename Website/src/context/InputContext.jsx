// InputContext.js
import { createContext, useContext, useState } from "react";

const InputContext = createContext();

export const InputProvider = ({ children }) => {
  const [inputValue, setInputValue] = useState("");

  return (
    <InputContext.Provider value={{ inputValue, setInputValue }}>
      {children}
    </InputContext.Provider>
  );
};

export const useInput = () => {
  return useContext(InputContext);
};
