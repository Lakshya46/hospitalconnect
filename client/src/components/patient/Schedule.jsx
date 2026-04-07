export default function Schedule() {
  return (
    <div>

      <h1 className="text-2xl font-bold mb-4">
        Schedule Appointment
      </h1>

      <div className="bg-white p-6 rounded-xl shadow space-y-3">

        <input className="w-full p-3 border rounded" placeholder="Hospital Name" />
        <input type="date" className="w-full p-3 border rounded" />
        <input type="time" className="w-full p-3 border rounded" />

        <button className="w-full bg-red-600 text-white py-3 rounded-lg">
          Book Appointment
        </button>

      </div>

    </div>
  );
}