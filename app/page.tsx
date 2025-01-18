import React from "react";
import Navbar from "../components/Navbar";
import MainComponent from "../components/MainComponent";

function Home() {
  return (
    <div className="relative min-h-screen bg-[#ede9f7] dark:bg-black">
      <Navbar />
      <MainComponent />
    </div>
  );
}

export default Home;
