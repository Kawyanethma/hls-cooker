import { r as reactExports, n as React, j as jsxRuntimeExports, m as clientExports, l as R } from "./theme-DWd5l5yA.js";
function SplashApp() {
  const [status, setStatus] = reactExports.useState("Initializing...");
  const hasSentReady = React.useRef(false);
  reactExports.useEffect(() => {
    const logHandler = (_, msg) => setStatus(msg);
    window.electron.ipcRenderer.on("log", logHandler);
    if (!hasSentReady.current) {
      window.electron.ipcRenderer.send("splash-ready");
      hasSentReady.current = true;
    }
    return () => {
      window.electron.ipcRenderer.removeListener("log", logHandler);
    };
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "splash-card", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "splash-body", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "logo", children: [
        "HLS ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Cooker" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "logo-subtext", children: "Developed by Kawyanethma Walisundara" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "spinner" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "status-text", children: status })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "copy-write-text", children: [
      "© ",
      (/* @__PURE__ */ new Date()).getFullYear(),
      " Evoke International Limited"
    ] })
  ] });
}
clientExports.createRoot(document.getElementById("splash-root")).render(
  /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.StrictMode, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(R, { appearance: "dark", accentColor: "orange", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SplashApp, {}) }) })
);
