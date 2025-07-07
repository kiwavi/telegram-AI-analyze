import React, { useState } from "react";
import FetchTags from "./tags";
import "./tailwind.css";
import axios, { isCancel, AxiosError } from "axios";

function App() {
  const [tags, setTags] = useState<string[]>([]);
  const [data, setData] = useState<object[]>([]);

  const handleTagsChange = (updatedTags: string[]) => {
    setTags(updatedTags);
  };

  async function fetchData(e: React.FormEvent<HTMLButtonElement>) {
    e.preventDefault();
    let tagsJoined = tags.join("&tags=");
    try {
      let data = await axios.get(
        `http://localhost:3099/messages?tags=${tagsJoined}`
      );
      setData(data.data);
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <div className="App">
      <h1 className="text-3xl"> Telegram search </h1>
      {/* get tags */}
      <FetchTags onChange={handleTagsChange} />

      <div>
        <button className="" onClick={fetchData}>
          {" "}
          Search Tags{" "}
        </button>
      </div>
    </div>
  );
}

export default App;
