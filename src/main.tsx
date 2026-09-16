import React from "react";
import ReactDOM from "react-dom/client";
import { PaymerchApp } from "./components/paymerch/PaymerchApp";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PaymerchApp />
  </React.StrictMode>,
);
