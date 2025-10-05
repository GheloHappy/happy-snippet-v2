import { BrowserRouter, Route, Routes } from "react-router-dom";
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
  return (
    <>
      <Nav />
      <Routes>
        <Route path="/" element={<AuthPage />} />
      </Routes>
    </>
  )
}

export default App