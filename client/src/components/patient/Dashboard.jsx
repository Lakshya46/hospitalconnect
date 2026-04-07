export default function Dashboard() {
  return (
    <div>

      <h1 className="text-3xl font-bold text-red-700 mb-6">
        Patient Dashboard
      </h1>

      <div className="grid md:grid-cols-3 gap-4">

        <div className="bg-white p-5 rounded-xl shadow">
          <h3>Upcoming Appointments</h3>
          <p className="text-2xl font-bold text-red-600">2</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <h3>Total Visits</h3>
          <p className="text-2xl font-bold text-blue-600">12</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <h3>Reports</h3>
          <p className="text-2xl font-bold text-green-600">5</p>
        </div>

      </div>

    </div>
  );
}