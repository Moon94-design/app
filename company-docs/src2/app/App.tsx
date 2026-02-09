import { Suspense } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import Loading from "./components/Loading";
import AppRoutes from "./routes/routes";

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Loading />}>
        <AppRoutes />
      </Suspense>
    </ErrorBoundary>
  );
}
