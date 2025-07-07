import React from "react";
import FetchTags from "./tags";
import "./tailwind.css";

function App() {
  return (
    <div className="App">
      <h1 className="text-3xl"> Telegram search </h1>
      {/* get tags */}
      <FetchTags />
    </div>
  );
}

export default App;
