import React, { useState } from "react";

function HRTicketsForm() {
  const [form, setForm] = useState({
    employeeId: "",
    department: "",
    issue: "",
    description: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Ticket submitted! (This is a stub)");
    setForm({ employeeId: "", department: "", issue: "", description: "" });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow max-w-md border border-gray-200">
      <label className="block text-xs font-medium text-gray-700 mb-1">Employee ID</label>
      <input
        className="mb-3 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
        type="text"
        name="employeeId"
        placeholder="Value"
        value={form.employeeId}
        onChange={handleChange}
        required
      />
      <label className="block text-xs font-medium text-gray-700 mb-1">Department</label>
      <input
        className="mb-3 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
        type="text"
        name="department"
        placeholder="Value"
        value={form.department}
        onChange={handleChange}
        required
      />
      <label className="block text-xs font-medium text-gray-700 mb-1">Issue</label>
      <input
        className="mb-3 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
        type="text"
        name="issue"
        placeholder="Value"
        value={form.issue}
        onChange={handleChange}
        required
      />
      <label className="block text-xs font-medium text-gray-700 mb-1">Issue Description</label>
      <textarea
        className="mb-4 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
        name="description"
        placeholder="Value"
        value={form.description}
        onChange={handleChange}
        required
        rows={3}
      />
      <button
        type="submit"
        className="bg-zinc-900 text-white px-6 py-2 rounded-xl font-medium hover:bg-zinc-800 flex items-center gap-2"
      >
        <span>&#11088;</span> Submit
      </button>
    </form>
  );
}

export default HRTicketsForm;