import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://bolt-back.onrender.com';
const VALUE_THRESHOLD = 12.5;
const SALARY_MAX = 15;

export default function Home() {
  const [propsData, setPropsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [dark, setDark] = useState(true);
  const [flashKey, setFlashKey] = useState(0);

  const fetchBoard = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/board`, { timeout: 10000 });
      // support both shapes: {data:...} or {matches:...}
      const raw = res.data.data || res.data.matches || res.data;
      const rows = [];
      if (Array.isArray(raw)) {
        raw.forEach(match => {
          if (match.teams && match.teams.length) {
            rows.push({
              player: match.teams.join(' vs '),
              match: match.time || '',
              kill_line: match.kill_line || match.line_score || 0,
              hs_line: match.hs_line || 0,
              salary: match.salary || 0,
              kpr: match.kpr || 0
            });
          } else if (match.player) {
            rows.push({
              player: match.player,
              match: match.league || '',
              kill_line: match.line_score || match.line || 0,
              hs_line: match.hs_line || 0,
              salary: match.salary || 0,
              kpr: match.kpr || 0
            });
          }
        });
      } else if (raw && raw.board) {
        Object.entries(raw.board).forEach(([game, items]) => {
          items.forEach(it => rows.push({
            player: it.player || it.name || '',
            match: game,
            kill_line: it.line || it.value || 0,
            hs_line: it.hs_line || 0,
            salary: it.salary || 0,
            kpr: it.kpr || 0
          }));
        });
      }

      const enriched = rows.map(r => {
        const hs = parseFloat(r.hs_line) || 0;
        const kpr = parseFloat(r.kpr) || 0;
        const salary = parseFloat(r.salary) || 0;
        const valueScore = (hs * 0.65 + kpr * 0.35) - salary;
        return {...r, valueScore, salary};
      }).filter(r => r.salary <= SALARY_MAX && r.valueScore >= VALUE_THRESHOLD);

      // if there are changes, bump flashKey to trigger animation
      setPropsData(prev => {
        const same = JSON.stringify(prev) === JSON.stringify(enriched);
        if (!same) setFlashKey(k => k + 1);
        return enriched;
      });
      setLastUpdate(new Date().toLocaleString());
    } catch (err) {
      console.error('Error fetching board:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoard();
    const interval = setInterval(fetchBoard, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('light-mode', !dark);
  }, [dark]);

  return (
    <div className={`page-root ${dark ? 'dark' : 'light'}`}>
      <header className="topbar">
        <div className="brand">
          <div className="bolt">⚡</div>
          <div>
            <h1>Bolt</h1>
            <div className="tag">Lightning-fast prop checks</div>
          </div>
        </div>
        <div className="controls">
          <div className="update">Last: {lastUpdate || '—'}</div>
          <button className="btn" onClick={() => fetchBoard()}>Refresh</button>
          <button className="btn muted" onClick={() => setDark(d => !d)}>{dark ? 'Light' : 'Dark'}</button>
        </div>
      </header>

      <main className="main">
        {loading && <div className="loading">Loading props…</div>}

        {!loading && propsData.length === 0 && (
          <div className="empty">No good props right now. Check again in 30 minutes.</div>
        )}

        {!loading && propsData.length > 0 && (
          <div className="board-wrap" key={flashKey}>
            <table className="board full-width">
              <thead>
                <tr>
                  <th>Player / Match</th>
                  <th>Kills</th>
                  <th>HS%</th>
                  <th>KPR</th>
                  <th>Salary</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {propsData.map((p, i) => (
                  <tr key={`${p.player}-${i}`} className="row lightning">
                    <td className="player">
                      <div className="player-name">{p.player}</div>
                      <div className="player-match">{p.match}</div>
                    </td>
                    <td className="center">{p.kill_line}</td>
                    <td className="center">{p.hs_line}</td>
                    <td className="center">{p.kpr?.toFixed ? p.kpr.toFixed(2) : p.kpr}</td>
                    <td className="center">{p.salary}</td>
                    <td className="value center">{p.valueScore.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <footer className="footer">Bolt — built for quick decisions</footer>
    </div>
  );
}
