import React from "react";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding: 12, borderBottom: "1px solid #eee" }}>
        <Link to="/">Refurbished Laptops</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
