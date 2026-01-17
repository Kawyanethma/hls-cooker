import { r as reactExports, j as jsxRuntimeExports, c as clientExports } from "./client-CGDFTTr8.js";
const RESOLUTIONS = ["240p", "360p", "480p", "720p", "1080p"];
function App() {
  const [files, setFiles] = reactExports.useState([]);
  const [outputDir, setOutputDir] = reactExports.useState(null);
  const [toggles, setToggles] = reactExports.useState([true, true, true, true, true]);
  const [logs, setLogs] = reactExports.useState([]);
  const [progress, setProgress] = reactExports.useState({});
  reactExports.useEffect(() => {
    if (!window.electronAPI) return;
    window.electronAPI.rendererReady();
    const onLog = (msg) => {
      setLogs((prev) => prev.includes(msg) ? prev : [...prev, msg]);
    };
    const onProgress = (data) => {
      setProgress((prev) => ({
        ...prev,
        [data.idx]: { perc: data.perc, eta: data.eta, done: false }
      }));
    };
    const onDone = (idx) => {
      setProgress((prev) => ({
        ...prev,
        [idx]: { perc: 100, done: true }
      }));
    };
    window.electronAPI.onLog(onLog);
    window.electronAPI.onUpdateProgress(onProgress);
    window.electronAPI.onDoneFile(onDone);
    return () => {
      if (window.electron?.ipcRenderer) {
        window.electron.ipcRenderer.removeAllListeners("log");
        window.electron.ipcRenderer.removeAllListeners("update-progress");
        window.electron.ipcRenderer.removeAllListeners("done-file");
      }
    };
  }, []);
  const selectFiles = async () => {
    const selected = await window.electronAPI.selectFiles();
    if (!selected?.length) return;
    setFiles(selected);
    setProgress({});
  };
  const selectOutputDir = async () => {
    const dir = await window.electronAPI.selectOutputDir();
    if (dir) setOutputDir(dir);
  };
  const startEncode = () => {
    if (!files.length) return alert("Please select files first");
    const choices = toggles.map((v) => v ? "y" : "n");
    window.electronAPI.runEncode({ files, choices, outputDir });
  };
  const cancelFile = (idx) => {
    window.electronAPI.cancelFile(idx);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "1. Source & Output" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: "10px" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: selectFiles, children: "Select Videos" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: selectOutputDir, children: "Output Folder" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "file-list", children: files.length === 0 ? "No videos selected" : `${files.length} files ready` }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "output", children: [
        "Path: ",
        outputDir ?? "Source folder"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "2. Resolutions" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "switch-group", children: RESOLUTIONS.map((res, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "switch-item", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: res }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "checkbox",
            checked: toggles[i],
            onChange: () => setToggles((prev) => prev.map((v, idx) => idx === i ? !v : v))
          }
        )
      ] }, res)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "start-btn", onClick: startEncode, children: "START ENCODE" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Encoding Status" }),
    files.map((f, i) => {
      const p = progress[i];
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "progress-item", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "progress-header", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: f.split(/[\\/]/).pop() }),
          !p?.done && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => cancelFile(i), children: "Cancel" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "progress-track", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "progress-bar", style: { width: `${p?.perc ?? 0}%` }, children: p?.done ? "✅ COMPLETED" : p ? `${p.perc.toFixed(1)}% (ETA: ${p.eta}s)` : "Ready" }) })
      ] }, i);
    }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "System Logs" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "logs", children: logs.map((l, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        style: l.toLowerCase().includes("error") ? { color: "red" } : {},
        children: `> ${l}`
      },
      i
    )) })
  ] });
}
clientExports.createRoot(document.getElementById("root")).render(
  /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.StrictMode, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(App, {}) })
);
