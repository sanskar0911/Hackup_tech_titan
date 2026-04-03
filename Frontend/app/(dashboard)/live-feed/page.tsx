import { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

export default function LiveFeed() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    socket.on("transaction", (tx) => {
      setTransactions((prev) => [tx, ...prev]);
    });
  }, []);

  return (
    <div>
      {transactions.map((tx, i) => (
        <div key={i} className={`bubble ${getColor(tx.risk)}`}>
          ₹{tx.amount} → {tx.receiver}
          <br />
          Risk: {tx.risk}
        </div>
      ))}
    </div>
  );
}

const getColor = (risk) => {
  if (risk > 70) return "red";
  if (risk > 40) return "yellow";
  return "green";
};