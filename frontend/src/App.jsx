import { BrowserRouter, Routes, Route } from "react-router-dom";
import SmsList from "./pages/SmsList";
import SmsStats from "./pages/SmsStats";
import ContactView from "./pages/ContactView";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SmsList />} />
        <Route path="/sms/:id" element={<SmsStats />} />
        <Route path="/contact/:id" element={<ContactView />} />
      </Routes>
    </BrowserRouter>
  );
}
