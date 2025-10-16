import React, { useState, useEffect } from "react";
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

    async function getData() {
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
        // receives the data and sorts it in a format that can be charted. Send to db as json
        let channels = Array.from(
            new Set(data.data.map((dt) => dt.channelName)),
        );
        setAllChannels(channels);
        let dates = Array.from(new Set(data.data.map((dt) => dt.created_at)));
        let sortedData = [];

        // for each date, go through the dataset. For each channel, find the number of mentions per day
        for (let date of dates) {
            let obj = { date } as Record<string, number> & { date: string };
            obj.date = date;
            for (let chan of channels) {
                let mentions = data.data.filter(
                    (x) => x.created_at === date && x.channelName === chan,
                ).length;

                obj[chan] = mentions;
            }
            sortedData.push(obj);
        }

        // console.log(sortedData);

        setSorted(sortedData);
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
                        <XAxis
                            dataKey="date"
                            tickFormatter={(d) => d.split("T")[0]}
                        />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {all_channels.map((chan, i) => (
                            <Line
                                // key={chan}
                                type="monotone"
                                dataKey={chan}
                                strokeWidth={4}
                                stroke={
                                    [
                                        "#8884d8",
                                        "#82ca9d",
                                        "#ff7300",
                                        "#00C49F",
                                        "#FFBB28",
                                    ][i % 5]
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
