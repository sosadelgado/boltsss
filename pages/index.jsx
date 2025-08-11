import React, { useEffect, useState } from "react";
import axios from "axios";

const BoltApp = () => {
  const [propsData, setPropsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const threshold = 8.0; // Frontend filter

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        setLoading(true);
        const res = await axios.get("https://bolt-back.onrender.com/board");
        setPropsData(res.data.props || []);
        setLastUpdated(res.data.last_updated);
      } catch (err) {
        console.error("Error fetching board:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBoard();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-4xl font-bold text-yellow-400 mb-4">
        ⚡ Bolt Board
      </h1>
      {lastUpdated && (
        <p className="text-sm text-gray-400 mb-4">
          Last updated: {new Date(lastUpdated * 1000).toLocaleString()}
        </p>
      )}

      {loading ? (
        <p>Loading board...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-800">
                <th className="px-4 py-2 text-left">Player</th>
                <th className="px-4 py-2 text-left">Team</th>
                <th className="px-4 py-2 text-left">Opponent</th>
                <th className="px-4 py-2 text-left">Kills Line</th>
                <th className="px-4 py-2 text-left">HS Line</th>
                <th className="px-4 py-2 text-left">Salary</th>
                <th className="px-4 py-2 text-left">Match Time</th>
                <th className="px-4 py-2 text-left">Value Score</th>
              </tr>
            </thead>
            <tbody>
              {propsData.map((item, idx) => (
                <tr
                  key={idx}
                  className={`border-b border-gray-800 ${
                    item.value_score >= threshold
                      ? "bg-yellow-500 text-black font-bold animate-pulse"
                      : ""
                  }`}
                >
                  <td className="px-4 py-2">{item.player}</td>
                  <td className="px-4 py-2">{item.team}</td>
                  <td className="px-4 py-2">{item.opponent}</td>
                  <td className="px-4 py-2">{item.kills_line}</td>
                  <td className="px-4 py-2">{item.hs_line}</td>
                  <td className="px-4 py-2">{item.salary}</td>
                  <td className="px-4 py-2">{item.match_time}</td>
                  <td className="px-4 py-2">{item.value_score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BoltApp;
