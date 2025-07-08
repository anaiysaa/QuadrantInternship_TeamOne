import React from "react";
import AnonymousReportForm from "../componenets/anon-dashboard/AnonymousReportForm";
import PendingResponses from "../componenets/anon-dashboard/PendingResponses";

function App() {
  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <div className="bg-zinc-900 text-white px-8 py-2 flex flex-col">
        <div className="flex items-center justify-between">
          <span className="opacity-70 text-base">Anonymous Report</span>
          <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden">
            <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="user" />
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-4xl font-light tracking-tight">PeoplePath</span>
        </div>
      </div>
      {/* Nav */}
      <div className="bg-zinc-800 text-white flex space-x-6 px-8 py-2 text-lg">
        <span className="hover:underline cursor-pointer">My Dashboard</span>
        <span className="hover:underline cursor-pointer">My Timesheet</span>
        <span className="hover:underline cursor-pointer">My Careers</span>
      </div>
      {/* Main content */}
      <div className="flex flex-col md:flex-row gap-6 px-4 md:px-10 py-8 justify-center">
        {/* Submit Report form */}
        <div className="flex-1 max-w-xl">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-2xl">&#8592;</span>
            <h2 className="text-2xl font-medium">Submit Report</h2>
          </div>
          <AnonymousReportForm />
        </div>
        {/* Pending Responses */}
        <div className="flex-1 max-w-lg">
          <h2 className="text-2xl font-medium mb-4">Pending Responses</h2>
          <PendingResponses />
        </div>
      </div>
    </div>
  );
}

export default App;