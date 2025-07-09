
import { useEffect, useState } from "react";

export default function KennyApp() {
  const [ticks, setTicks] = useState([]);
  const [prediction, setPrediction] = useState("Waiting for ticks...");

  useEffect(() => {
    const ws = new WebSocket("wss://ws.derivws.com/websockets/v3?app_id=1089");

    ws.onopen = () => {
      ws.send(JSON.stringify({ ticks: "R_100", subscribe: 1 }));
    };

    ws.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      if (data.tick) {
        const digit = Number(data.tick.quote.toString().slice(-1));
        const newTicks = [...ticks, digit];
        if (newTicks.length > 20) newTicks.shift();
        setTicks(newTicks);

        const count = {};
        newTicks.forEach(d => count[d] = (count[d] || 0) + 1);
        const oddCount = newTicks.filter(d => d % 2 === 1).length;
        const evenCount = newTicks.length - oddCount;

        let suggestion = "";
        const likely = Object.keys(count).filter(k => count[k] >= 3);
        if (likely.length > 0) suggestion += `Likely match: ${likely.join(", ")}. `;
        if (oddCount > evenCount + 5) suggestion += "Trend: Odd dominant.";
        else if (evenCount > oddCount + 5) suggestion += "Trend: Even dominant.";
        else suggestion += "No strong trend.";

        setPrediction(suggestion);
      }
    };

    return () => ws.close();
  }, [ticks]);

  return (
    <div style={{ fontFamily: 'Arial', padding: 20 }}>
      <h2>Kenny - Digit Match Predictor</h2>
      <p>Last 20 Digits: {ticks.join(', ')}</p>
      <h3>{prediction}</h3>
    </div>
  );
}
