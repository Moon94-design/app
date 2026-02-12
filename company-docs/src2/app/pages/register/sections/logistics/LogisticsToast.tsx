type LogisticsToastProps = {
  message: string;
};

export default function LogisticsToast({ message }: LogisticsToastProps) {
  if (!message) return null;

  return (
    <div
      style={{
        position: "fixed",
        right: 16,
        bottom: 16,
        zIndex: 60,
        background: "#1f6feb",
        color: "#fff",
        borderRadius: 10,
        padding: "10px 14px",
        boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
        fontSize: 13,
        maxWidth: "min(360px, calc(100vw - 32px))",
      }}
    >
      {message}
    </div>
  );
}
