export default function Appointments() {

  const data = [
    { id: 1, hospital: "AIIMS Bhopal", date: "12 Apr", status: "Upcoming" },
    { id: 2, hospital: "Heart Care", date: "5 Apr", status: "Completed" }
  ];

  return (
    <div>

      <h1 className="text-2xl font-bold mb-4">
        My Appointments
      </h1>

      {data.map(a => (
        <div key={a.id} className="bg-white p-4 rounded-lg shadow mb-3">

          <p className="font-bold text-red-700">{a.hospital}</p>
          <p>{a.date}</p>

          <span className={`text-sm font-semibold
            ${a.status === "Upcoming" ? "text-green-600" : "text-gray-500"}`}>
            {a.status}
          </span>

        </div>
      ))}

    </div>
  );
}