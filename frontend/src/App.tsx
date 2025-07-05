import React from "react";
import "./App.css";
import FetchTags from "./tags";

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
