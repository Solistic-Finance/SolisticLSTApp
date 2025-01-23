import React from "react";
import Navbar from "../components/Navbar";
import MainComponent from "../components/MainComponent";
import Footer from "../components/Footer";

function Home() {
  return (
    <div className="relative min-h-screen bg-[#ede9f7] dark:bg-black">
      <Navbar />
      <MainComponent />
      <Footer/>
    </div>
  );
}

export default Home;
