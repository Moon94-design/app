type ParseStatus = "OK" | "INCOMPLETE" | "FAIL";

export function renderStatusBadge(status: ParseStatus) {
  const label = status === "OK" ? "완료" : status === "INCOMPLETE" ? "미완료" : "실패";
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 6px",
        borderRadius: 3,
        fontSize: 11,
        fontWeight: 700,
        background:
          status === "OK"
            ? "rgba(100,200,100,0.3)"
            : status === "INCOMPLETE"
              ? "rgba(255,200,100,0.3)"
              : "rgba(255,100,100,0.3)",
        color:
          status === "OK"
            ? "rgba(100,255,150,1)"
            : status === "INCOMPLETE"
              ? "rgba(255,200,100,1)"
              : "rgba(255,100,100,1)",
      }}
    >
      {label}
    </span>
  );
}
