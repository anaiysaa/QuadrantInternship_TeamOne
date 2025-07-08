import React, { useEffect, useState } from "react";

function PendingTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetch("http://localhost:8000/hr_tickets")
      .then((res) => res.json())
      .then((data) => {
        setTickets(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch tickets:", err);
        setLoading(false);
      });
  }, []);

  const handleFilterChange = (status) => {
    setFilter(status);
  };

  const filteredTickets = tickets.filter((t) =>
    filter === "All" ? true : t.Status.toLowerCase() === filter.toLowerCase()
  );

  if (loading) return <div>Loading...</div>;
  if (filteredTickets.length === 0) return <div>No tickets found</div>;

  return (
    <div className="bg-gray-100 p-6 rounded-2xl shadow flex flex-col gap-4">
      <div className="flex gap-4 mb-4">
        {['All', 'Open', 'In Progress', 'Closed'].map((status) => (
          <button
            key={status}
            onClick={() => handleFilterChange(status)}
            className={`px-4 py-2 rounded-xl font-medium shadow ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {filteredTickets.map((t) => (
        <div
          key={t.TicketID}
          className="flex items-center justify-between bg-gray-200 rounded-xl px-4 py-3 text-lg"
        >
          <span className="font-medium">{t.Status}</span>
          <span className="flex-1 text-center text-gray-700">{t.Title}</span>
          <span className="text-gray-500 text-base">{t.SubmittedDate}</span>
        </div>
      ))}
    </div>
  );
}

export default PendingTickets;
