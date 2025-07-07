import React, { useState } from "react";
import FetchTags from "./tags";
import "./tailwind.css";

function App() {
  const [tags, setTags] = useState<string[]>([]);

  const handleTagsChange = (updatedTags: string[]) => {
    setTags(updatedTags);
    console.log("Tags in parent:", updatedTags);
  };

  return (
    <div className="App">
      <h1 className="text-3xl"> Telegram search </h1>
      {/* get tags */}
      <FetchTags onChange={handleTagsChange} />
    </div>
  );
}

export default App;
