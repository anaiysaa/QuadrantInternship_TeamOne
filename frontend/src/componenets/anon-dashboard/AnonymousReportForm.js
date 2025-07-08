import React, { useState } from "react";

function AnonymousReportForm() {
  const [form, setForm] = useState({
    recipient: "",
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
    alert("Report submitted anonymously! (This is a stub)");
    setForm({ recipient: "", issue: "", description: "" });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow max-w-xl border border-gray-200">
      <label className="block text-xs font-medium text-gray-700 mb-1">Recipient</label>
      <input
        className="mb-2 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
        type="text"
        name="recipient"
        placeholder="Value"
        value={form.recipient}
        onChange={handleChange}
        required
      />
      <div className="text-xs text-gray-500 mb-2">
        *Dropdown allowing narrowing selection as they type, including all higher ups
      </div>
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
      <div className="text-sm text-gray-800 mb-4">
        We are committed to maintaining a safe healthy workplace, therefore all feedback will be reported anonymously and automatically forwarded to HR for review.
      </div>
      <button
        type="submit"
        className="bg-zinc-900 text-white px-6 py-2 rounded-xl font-medium hover:bg-zinc-800 flex items-center gap-2"
      >
        <span>&#11088;</span> Submit
      </button>
    </form>
  );
}

export default AnonymousReportForm;