import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import Nav from "./components/Nav";

function App() {
  return (
    <BrowserRouter>
      <Root />
    </BrowserRouter>

  )
}

function Root() {
  const location = useLocation();
  const shouldShowNav = location.pathname !== "*";

  console.log(shouldShowNav)
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