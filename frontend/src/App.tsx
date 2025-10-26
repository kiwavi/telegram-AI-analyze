import React, { useState, useEffect, useTransition } from "react";
import FetchTags from "./tags";
import "./tailwind.css";
import axios from "axios";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function App() {
  const [tags, setTags] = useState<string[]>([]);
  const [data, setData] = useState<object[]>([]);
  const [sorted, setSorted] = useState<object[]>([]);
  const [all_channels, setAllChannels] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  async function getData() {
    let tagsJoined = tags.join("&tags=");
    try {
      let data = await axios.get(
        `http://localhost:3099/messages?tags=${tagsJoined}`,
      );
      startTransition(() => {
        setData(data.data);
        sortData(data.data);
      });
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    if (tags.length > 0) {
      getData();
    } else {
      setSorted([]);
    }
  }, [tags]);

  const handleTagsChange = async (updatedTags: string[]) => {
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
    const messages = data.data;
    const grouped = new Map();

    for (const msg of messages) {
      const { created_at, channelName } = msg;
      if (!grouped.has(created_at))
        grouped.set(created_at, { date: created_at });
      const entry = grouped.get(created_at);
      entry[channelName] = (entry[channelName] || 0) + 1;
    }

    const allDates = Array.from(grouped.keys()).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime(),
    );

    const channels = Array.from(new Set(messages.map((m) => m.channelName)));

    const filled = allDates.map((date) => {
      const row = grouped.get(date)!;
      for (const chan of channels) {
        if (!(chan in row)) row[chan] = 0;
      }
      return row;
    });

    setAllChannels(channels);
    setSorted(filled);
  };

  async function fetchData(e: React.FormEvent<HTMLButtonElement>) {
    e.preventDefault();
    await getData();
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

      <div style={{ width: "100%", height: 400 }}>
        <ResponsiveContainer>
          <LineChart
            data={sorted}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={(d) => d.split("T")[0]} />
            <YAxis />
            <Tooltip />
            <Legend />
            {all_channels.map((chan, i) => (
              <Line
                key={chan}
                type="monotone"
                dataKey={chan}
                strokeWidth={3}
                stroke={
                  ["#8884d8", "#82ca9d", "#ff7300", "#00C49F", "#FFBB28"][i % 5]
                }
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default App;
