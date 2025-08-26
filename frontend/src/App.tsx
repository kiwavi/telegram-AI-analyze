import React, { useState } from "react";
import FetchTags from "./tags";
import "./tailwind.css";
import axios from "axios";

function App() {
  const [tags, setTags] = useState<string[]>([]);
  const [data, setData] = useState<object[]>([]);
  const [sorted, setSorted] = useState<object[]>([]);

  const handleTagsChange = (updatedTags: string[]) => {
    setTags(updatedTags);
  };

  const sortData = (data: {
    success: boolean;
    data: {
      messageId: number;
      messageText: string;
      channelName: string;
      created_at: string;
    }[];
  }) => {
    // receives the data and sorts it in a format that can be charted. Send to db as json
    function getMonthKey(dateStr: string) {
      const d = new Date(dateStr);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    }

    const counts: { [key: string]: number } = {};

    for (const msg of data.data) {
      const month: string = getMonthKey(msg.created_at);
      const key: string = `${msg.channelName}__${month}`;
      counts[key] = (counts[key] || 0) + 1;
    }

    // Step 4: restructure for charting
    const result = Object.entries(counts).map(([key, mentions]) => {
      const [channelName, month] = key.split("__");
      return { channelName, month, mentions };
    });

    setSorted(result);
  };

  async function fetchData(e: React.FormEvent<HTMLButtonElement>) {
    e.preventDefault();
    let tagsJoined = tags.join("&tags=");
    try {
      let data = await axios.get(
        `http://localhost:3099/messages?tags=${tagsJoined}`,
      );
      sortData(data.data);
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
      {/*render chart as long as sorted is true*/}
      
    </div>
  );
}

export default App;
