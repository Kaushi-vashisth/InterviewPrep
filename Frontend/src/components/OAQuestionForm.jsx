import { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// 👇 static list of companies
import COMPANIES from "../constants/CompanyNames"; // adjust the path if your constants folder differs

const emptyQuestion = () => ({
  question: "",
  options: ["", "", "", ""],
  answer: "",
  explanation: "",
});

export default function OAQuestionForm({ onClose, isAnonymous }) {
  /* ---------------- form state ---------------- */
  const [company,   setCompany]   = useState("");
  const [role,      setRole]      = useState("");
  const [year,      setYear]      = useState("");
  const [questions, setQuestions] = useState([emptyQuestion()]);

  const [submitting, setSubmitting] = useState(false);

  /* ---------------- helpers ---------------- */
  const handleChange = (idx, field, value) =>
    setQuestions((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, [field]: value } : q))
    );

  const handleOptionChange = (qIdx, optIdx, value) =>
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx
          ? {
              ...q,
              options: q.options.map((opt, j) => (j === optIdx ? value : opt)),
            }
          : q
      )
    );

  const addQuestion    = () => setQuestions((prev) => [...prev, emptyQuestion()]);
  const removeQuestion = (idx) =>
    setQuestions((prev) =>
      prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev
    );

  /* ---------------- submit ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!company || !role || !year) {
      toast.error("Company, role, and year are required.");
      return;
    }
    if (questions.some((q) => !q.question.trim())) {
      toast.error("Each entry must include a question text.");
      return;
    }

    try {
      setSubmitting(true);
      await axios.post("http://localhost:5000/oa/bulk", {
        company,
        role,
        year: Number(year),
        questions,
        anonymous: isAnonymous,
      });

      toast.success("OA question(s) saved! 🎉");
      setCompany("");
      setRole("");
      setYear("");
      setQuestions([emptyQuestion()]);
      if (onClose) setTimeout(onClose, 800);
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      toast.error(`Save failed: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg shadow p-6 md:p-8 space-y-8 w-[90vw] md:w-[600px] max-h-[90vh] overflow-y-auto custom-scrollbar"
    >
      {/* toasts */}
      <ToastContainer
        position="top-center"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop
        pauseOnFocusLoss
        pauseOnHover
        theme="light"
      />

      <h2 className="text-2xl font-bold text-blue-700 mb-2">Submit OA Question</h2>

      {/* meta */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* company dropdown */}
        <select
          className="input-box"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        >
          <option value="">Select Company*</option>
          {COMPANIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* role */}
        <select
          className="input-box"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="">Role* (select)</option>
          <option value="Internship">Internship</option>
          <option value="Placement">Placement</option>
        </select>

        {/* year */}
        <input
          type="number"
          className="input-box"
          placeholder="Year*"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          min="2000"
          max={new Date().getFullYear() + 1}
        />
      </div>

      {/* questions list */}
      {questions.map((q, idx) => (
        <div key={idx} className="border-b pb-5 mb-5 relative">
          {questions.length > 1 && (
            <button
              type="button"
              onClick={() => removeQuestion(idx)}
              className="absolute right-0 -top-2 text-red-500 text-xs"
            >
              ✕
            </button>
          )}

          <label className="block font-semibold mb-1">Question {idx + 1}*</label>
          <textarea
            className="input-box"
            rows={3}
            value={q.question}
            onChange={(e) => handleChange(idx, "question", e.target.value)}
            placeholder="Paste the OA question…"
          />

          <label className="block font-semibold mt-3">Options (optional)</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {q.options.map((opt, optIdx) => (
              <input
                key={optIdx}
                className="input-box"
                value={opt}
                onChange={(e) => handleOptionChange(idx, optIdx, e.target.value)}
                placeholder={`Option ${optIdx + 1}`}
              />
            ))}
          </div>

          <input
            className="input-box mt-3"
            placeholder="Answer (optional)"
            value={q.answer}
            onChange={(e) => handleChange(idx, "answer", e.target.value)}
          />
          <textarea
            className="input-box mt-2"
            rows={2}
            placeholder="Explanation (optional)"
            value={q.explanation}
            onChange={(e) => handleChange(idx, "explanation", e.target.value)}
          />
        </div>
      ))}

      {/* footer */}
      <div className="flex justify-between items-center">
        <button type="button" onClick={addQuestion} className="text-sm text-gray-600 hover:text-gray-800">
          + Add another
        </button>

        <div className="flex gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
            {submitting ? "Saving…" : "Submit"}
          </button>
        </div>
      </div>

      {isAnonymous && (
        <p className="text-xs text-gray-500 text-right">Submitted anonymously</p>
      )}
    </form>
  );
}
