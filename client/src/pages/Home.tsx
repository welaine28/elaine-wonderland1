import {useEffect, useState } from "react";
import { fetchMessage } from "../api/api";

// client/src/pages/Home.tsx
export default function Home() {
    const [data, setData] = useState({});

    useEffect(() => {
        fetchMessage().then((data) => {
            setData(data);
        });
        }, []);

    return (
        <div>
            <h1>Home Page</h1>
            <p>Data from server:</p>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
    );
}
