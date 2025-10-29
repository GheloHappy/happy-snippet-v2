import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import Nav from "./components/Nav";
import { AuthProvider, useAuth } from "./contexts/AuthProvider";
import { ToastProvider } from "./utils/Toast";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider >
        <Root />
        <ToastProvider />
      </AuthProvider>
    </BrowserRouter>
  )
}

function Root() {
  const { user } = useAuth();
  const shouldShowNav = !!user;

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