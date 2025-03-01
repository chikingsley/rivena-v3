import { BrowserRouter, Routes, Route } from "react-router";
import ChatPage from './pages/chat-page'
import ChatLayout from './layouts/chat-layout'
import './App.css'

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route element={<ChatLayout />}>
            <Route path="/" element={<ChatPage />} />
            <Route path="/chat" element={<ChatPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
