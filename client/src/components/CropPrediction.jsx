import React, { useState } from "react";


export default function CropPrediction() {
  const initial = {
    N: "",
    P: "",
    K: "",
    temperature: "",
    humidity: "",
    ph: "",
    rainfall: "",
  };

  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [notice, setNotice] = useState(null);

  // Reasonable validation ranges (you can change these to match your model's training ranges)
  const RANGES = {
    N: [0, 3000],
    P: [0, 3000],
    K: [0, 3000],
    temperature: [-10, 60],
    humidity: [0, 100],
    ph: [0, 14],
    rainfall: [0, 500],
  };

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
    setErrors((s) => ({ ...s, [name]: null }));
    setResult(null);
    setNotice(null);
  }

  function validate() {
    const errs = {};
    for (const key of Object.keys(RANGES)) {
      const val = parseFloat(form[key]);
      if (isNaN(val) && form[key] !== "0") {
        errs[key] = "Required and must be a number";
        continue;
      }
      const [min, max] = RANGES[key];
      if (val < min || val > max) {
        errs[key] = `Must be between ${min} and ${max}`;
      }
    }
    return errs;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setResult(null);
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length) {
      setNotice({ type: "error", text: "One or more inputs are outside allowed ranges." });
      return;
    }

    setLoading(true);
    setNotice(null);

    const payload = {
      N: Number(form.N),
      P: Number(form.P),
      K: Number(form.K),
      temperature: Number(form.temperature),
      humidity: Number(form.humidity),
      ph: Number(form.ph),
      rainfall: Number(form.rainfall),
    };

    try {
      // Try contacting backend predict endpoint. Replace URL if needed.
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        // expect { label: 'coffee' } or similar
        setResult({ label: data.label, confidence: data.confidence });
      } else {
        // Fallback to client-side mock if backend returns not ok
        const mock = mockPredict(payload);
        setNotice({ type: "warn", text: "Backend unavailable — using local mock prediction." });
        setResult(mock);
      }
    } catch (err) {
      // network error -> fallback
      const mock = mockPredict(payload);
      setNotice({ type: "warn", text: "Could not reach backend — showing mock prediction." });
      setResult(mock);
    } finally {
      setLoading(false);
    }
  }

  // Simple mock classifier: returns the most frequent label seen in sample data.
  // Replace with anything for demo only.
  function mockPredict(values) {
    return { label: "coffee (mock)", confidence: 0.78 };
  }

  function renderInput({ name, label, type = "number", step = "any" }) {
    const err = errors[name];
    const [min, max] = RANGES[name];
    return (
      <div className="w-full sm:w-1/2 lg:w-1/3 p-2" key={name}>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input
          name={name}
          value={form[name]}
          onChange={handleChange}
          type={type}
          step={step}
          min={min}
          max={max}
          placeholder={`${min} — ${max}`}
          className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-200 bg-white/90 ${
            err ? "border-red-400" : "border-gray-200"
          }`}
        />
        {err ? <p className="text-xs text-red-600 mt-1">{err}</p> : <p className="text-xs text-gray-400 mt-1">Range: {min} — {max}</p>}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-4xl w-full bg-white shadow-lg rounded-2xl overflow-hidden">
        <div className="p-6 bg-[rgba(245,247,244,0.9)]"> {/* subtle greyish white */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">Crop Predictor</h1>
              <p className="text-sm text-gray-500">Enter soil & weather features to get the model's prediction.</p>
            </div>
            <div className="px-3 py-1 rounded-lg bg-green-50 text-sm text-green-700">Model: Random Forest</div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="p-6">
          <div className="flex flex-wrap -m-2">
            {renderInput({ name: "N", label: "Nitrogen (N)" })}
            {renderInput({ name: "P", label: "Phosphorus (P)" })}
            {renderInput({ name: "K", label: "Potassium (K)" })}
            {renderInput({ name: "temperature", label: "Temperature (°C)" })}
            {renderInput({ name: "humidity", label: "Humidity (%)" })}
            {renderInput({ name: "ph", label: "pH" })}
            {renderInput({ name: "rainfall", label: "Rainfall (mm)" })}
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white px-4 py-2 rounded-2xl shadow-md disabled:opacity-60"
            >
              {loading ? "Predicting..." : "Predict"}
            </button>

            <button
              type="button"
              onClick={() => { setForm(initial); setErrors({}); setResult(null); setNotice(null); }}
              className="px-4 py-2 rounded-2xl border border-gray-200 text-sm"
            >
              Reset
            </button>

            <div className="ml-auto text-sm text-gray-500">Validation: client-side ranges enforced</div>
          </div>

          {/* Notices */}
          {notice && (
            <div className={`mt-4 p-3 rounded-lg ${notice.type === "error" ? "bg-red-50 text-red-700" : "bg-yellow-50 text-yellow-700"}`}>
              {notice.text}
            </div>
          )}

          {/* Result Card */}
          {result && (
            <div className="mt-6 p-4 rounded-xl bg-[rgba(236,253,245,0.9)] border border-green-100 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Predicted Crop</div>
                <div className="text-2xl font-semibold text-gray-800">{result.label}</div>
                {result.confidence !== undefined && (
                  <div className="text-sm text-gray-500 mt-1">Confidence: {(result.confidence * 100).toFixed(1)}%</div>
                )}
              </div>

              <div className="text-right">
                <div className="text-xs text-gray-400">Model</div>
                <div className="text-sm font-medium text-gray-700">Random Forest</div>
              </div>
            </div>
          )}
        </form>

        <div className="p-4 text-xs text-gray-500 bg-white/80 border-t border-gray-100">
          <strong>Notes:</strong> Update <code>/api/predict</code> endpoint to point to your server that loads the .pkl model. If you want example server code (Flask/Express) to load the pickle and return predictions, I can provide it.
        </div>
      </div>
    </div>
  );
}
