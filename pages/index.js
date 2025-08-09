import React, { useEffect, useState } from "react";

export default function Home() {
  const [propsData, setPropsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBoard() {
      try {
        const res = await fetch("https://bolt-back.onrender.com/board");
        const data = await res.json();
        console.log("DEBUG: Raw backend response →", data); // Debug log
        setPropsData(data);
      } catch (err) {
        console.error("Error fetching props:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBoard();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-4xl font-bold text-yellow-400 mb-6 text-center">
        ⚡ Bolt Prop Evaluator
      </h1>

      {loading ? (
        <p className="text-center text-gray-400">Loading props...</p>
      ) : propsData.length === 0 ? (
        <p className="text-center text-red-400">No props received from backend.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-700">
            <thead>
              <tr className="bg-gray-800">
                <th className="px-4 py-2 border border-gray-700">Player</th>
                <th className="px-4 py-2 border border-gray-700">Stat</th>
                <th className="px-4 py-2 border border-gray-700">Value Score</th>
                <th className="px-4 py-2 border border-gray-700">Salary</th>
                <th className="px-4 py-2 border border-gray-700">Expected Kills</th>
              </tr>
            </thead>
            <tbody>
              {propsData.map((prop, idx) => {
                const isGood = prop.value_score >= 12.5;
                return (
                  <tr
                    key={idx}
                    className={`text-center ${
                      isGood
                        ? "animate-pulse bg-yellow-500 text-black font-bold"
                        : "bg-gray-900"
                    }`}
                  >
                    <td className="px-4 py-2 border border-gray-700">{prop.player}</td>
                    <td className="px-4 py-2 border border-gray-700">{prop.stat}</td>
                    <td className="px-4 py-2 border border-gray-700">{prop.value_score}</td>
                    <td className="px-4 py-2 border border-gray-700">{prop.salary}</td>
                    <td className="px-4 py-2 border border-gray-700">{prop.expected_kills}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
