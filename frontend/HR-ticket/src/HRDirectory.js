import React from "react";

const people = [
  {
    name: "Jane doe",
    role: "Role",
    img: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    name: "Jane doe",
    role: "Role",
    img: "https://randomuser.me/api/portraits/women/44.jpg",
  },
];

function HRDirectory() {
  return (
    <div className="flex flex-col gap-6">
      {people.map((p, idx) => (
        <div
          key={idx}
          className="bg-gray-100 rounded-2xl shadow flex flex-col items-center p-6"
        >
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white mb-2">
            <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
          </div>
          <span className="text-xl font-medium mt-2">{p.name}</span>
          <span className="text-gray-500 text-lg">{p.role}</span>
        </div>
      ))}
    </div>
  );
}

export default HRDirectory;
