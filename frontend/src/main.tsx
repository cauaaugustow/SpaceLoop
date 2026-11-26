import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./index.css";

const elementoRaiz: HTMLElement | null = document.getElementById("root");
if (!elementoRaiz) throw new Error('O index.html precisa de um elemento com id "root".');

createRoot(elementoRaiz).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
