import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { InputProvider } from "./context/InputContext.jsx";
import { AuthProvider } from "./context/authContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <InputProvider>
        <App />
      </InputProvider>
    </AuthProvider>
  </BrowserRouter>
);
