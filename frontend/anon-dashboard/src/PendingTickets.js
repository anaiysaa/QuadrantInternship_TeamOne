import React from "react";

const tickets = [
  { status: "Resolved", issue: "Access request", date: "2025-07-01" },
  { status: "In Progress", issue: "Payroll update", date: "2025-07-05" },
  { status: "Submitted", issue: "Benefits question", date: "2025-07-06" },
];

function PendingTickets() {
  return (
    <div className="bg-gray-100 p-6 rounded-2xl shadow flex flex-col gap-3">
      {tickets.map((t, idx) => (
        <div
          key={t.status}
          className="flex items-center justify-between bg-gray-200 rounded-xl px-4 py-3 text-lg"
        >
          <span className="font-medium">{t.status}</span>
          <span className="flex-1 text-center text-gray-700">{t.issue}</span>
          <span className="text-gray-500 text-base">{t.date}</span>
        </div>
      ))}
    </div>
  );
}

export default PendingTickets;