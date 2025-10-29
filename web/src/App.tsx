import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import Nav from "./components/Nav";
import { toastError, toastLoading, ToastProvider, toastSuccess, toastWarning } from "./utils/Toast";

function App() {
  return (
    <BrowserRouter>
      <Root />

      <ToastProvider />
    </BrowserRouter>

  )
}

function Root() {
  const location = useLocation();
  const shouldShowNav = location.pathname !== "*";

  return (
    <>
      {shouldShowNav && <Nav />}

      <Routes>
        <Route path="/" element={<AuthPage />} />
      </Routes>
    </>
  )
}

export default App