import "react-app-polyfill/ie11";
import "react-app-polyfill/stable";
import { Profiler } from "react";
import ReactDOM from "react-dom/client";

import renderProfiler from "./utils/renderProfiler";
import reportWebVitals from "./utils/reportWebVitals";
import { SelectedAppProvider } from './components/SelectedAppContext';

import "./locales/i18n";
import App from "./App";

const isProfiler = false;
const appRender = isProfiler ? (
  <Profiler id="App" onRender={renderProfiler}>
    <SelectedAppProvider> <App />,</SelectedAppProvider>
   
  </Profiler>
) : (
   <SelectedAppProvider>  
    <App />
</SelectedAppProvider>
);

const root = ReactDOM.createRoot(document.getElementById("cra-root") as HTMLElement);
root.render(appRender);

reportWebVitals();
