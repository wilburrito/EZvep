import { BrowserRouter } from "react-router-dom";
import { createRoot } from "react-dom/client";
import { I18nextProvider } from "react-i18next";
import "antd/dist/antd.css";
import { Analytics } from "@vercel/analytics/react";
import Router from "./router";
import i18n from "./translation";

const App = () => (
  <BrowserRouter>
    <I18nextProvider i18n={i18n}>
      <Router />
      <Analytics/>
    </I18nextProvider>
  </BrowserRouter>
);

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(<App />);
