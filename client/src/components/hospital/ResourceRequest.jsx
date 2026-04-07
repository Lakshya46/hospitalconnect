import { useState, useEffect } from "react";
import api from "../../utils/api";

export default function ResourceRequest() {

  const [form, setForm] = useState({
    type: "",
    quantity: "",
    urgency: "Medium",
    description: "",
    receiverHospitalId: ""
  });

  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔥 FETCH BASED ON TYPE
  useEffect(() => {
    const fetchHospitals = async () => {
      if (!form.type) return;

      try {
        const res = await api.get(`/api/hospital/filter?type=${form.type}`);
        setHospitals(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchHospitals();
  }, [form.type]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/api/resources", form);

      alert("✅ Request sent successfully");

      setForm({
        type: "",
        quantity: "",
        urgency: "Medium",
        description: "",
        receiverHospitalId: ""
      });

      setHospitals([]); // reset hospitals

    } catch (err) {
      alert("❌ Error submitting request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-red-50 p-6">

      <h1 className="text-3xl font-bold text-red-700 mb-6">
        Smart Resource Request
      </h1>

      <div className="grid lg:grid-cols-2 gap-6">

        {/* 🔴 LEFT */}
        <div className="bg-white p-6 rounded-xl shadow space-y-5">

          <h2 className="text-xl font-semibold text-red-700">
            Create Request
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* TYPE */}
            <div>
              <label className="text-sm font-medium text-gray-600">
                Resource Type
              </label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full mt-1 p-3 border rounded-lg"
                required
              >
                <option value="">Select</option>
                <option>Blood</option>
                <option>Oxygen</option>
                <option>Bed</option>
                <option>ICU</option>
                <option>Medicine</option>
                <option>Ambulance</option>
              </select>
            </div>

            {/* 🔥 AVAILABLE HOSPITALS */}
            {form.type && (
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Available Hospitals
                </label>

                <select
                  name="receiverHospitalId"
                  value={form.receiverHospitalId}
                  onChange={handleChange}
                  className="w-full mt-1 p-3 border rounded-lg"
                  required
                >
                  <option value="">Select Hospital</option>

                  {hospitals.length === 0 && (
                    <option disabled>No hospitals available</option>
                  )}

                  {hospitals.map(h => (
                    <option key={h._id} value={h._id}>
                      {h.name} ({h.location})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* QUANTITY */}
            <div>
              <label className="text-sm font-medium text-gray-600">
                Quantity
              </label>
              <input
                name="quantity"
                type="number"
                value={form.quantity}
                onChange={handleChange}
                className="w-full mt-1 p-3 border rounded-lg"
                required
              />
            </div>

            {/* URGENCY */}
            <div>
              <label className="text-sm font-medium text-gray-600">
                Urgency
              </label>
              <select
                name="urgency"
                value={form.urgency}
                onChange={handleChange}
                className="w-full mt-1 p-3 border rounded-lg"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="text-sm font-medium text-gray-600">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="w-full mt-1 p-3 border rounded-lg"
              />
            </div>

            <button
              disabled={loading}
              className="w-full bg-red-600 text-white py-3 rounded-lg"
            >
              {loading ? "Sending..." : "Send Request"}
            </button>

          </form>
        </div>

        {/* 🔵 RIGHT */}
        <div className="bg-white p-6 rounded-xl shadow">

          <h2 className="text-xl font-semibold text-red-700 mb-4">
            How it Works
          </h2>

          <ol className="space-y-3 text-sm text-gray-600 list-decimal ml-4">
            <li>Select required resource</li>
            <li>System finds hospitals with availability</li>
            <li>Select hospital</li>
            <li>Send request</li>
          </ol>

          <div className="mt-6 p-4 bg-red-100 rounded-lg text-sm">
            ⚠️ Critical requests should only be used in emergencies
          </div>

        </div>

      </div>
    </div>
  );
}