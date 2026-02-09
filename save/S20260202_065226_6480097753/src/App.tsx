import { Outlet } from "react-router-dom";
import UiEditOverlay, { isUiEditEnabled, setUiEditEnabled } from "./base/dev/UiEditOverlay";
import { useEffect, useState } from "react";

export default function App() {
  const [uiEdit, setUiEdit] = useState<boolean>(() => isUiEditEnabled());

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === "ui_edit_enabled_v1") setUiEdit(isUiEditEnabled());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <>
      <Outlet />

      <button
        type="button"
        className="btn"
        style={{
          position: "fixed",
          left: 12,
          bottom: 12,
          zIndex: 2147483646,
          opacity: 0.9,
        }}
        onClick={() => {
          const next = !uiEdit;
          setUiEditEnabled(next);
          setUiEdit(next);
        }}
      >
        UI {uiEdit ? "기록중" : "기록"}
      </button>

      <UiEditOverlay />
    </>
  );
}