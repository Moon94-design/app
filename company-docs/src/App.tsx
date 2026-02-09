import { useState } from "react";
import AppRoutes from "./app/routes";
import UiEditOverlay, { isUiEditEnabled, setUiEditEnabled } from "./base/dev/UiEditOverlay";

export default function App() {
  const [uiEdit, setUiEdit] = useState<boolean>(() => isUiEditEnabled());

  function toggleUiEdit() {
    const next = !uiEdit;
    setUiEditEnabled(next);
    setUiEdit(next);
  }

  return (
    <>
      <AppRoutes />

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
        onClick={toggleUiEdit}
      >
        UI {uiEdit ? "기록중" : "기록"}
      </button>

      <UiEditOverlay
        enabled={uiEdit}
        onClose={() => {
          setUiEditEnabled(false);
          setUiEdit(false);
        }}
      />
    </>
  );
}