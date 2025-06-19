import { useState } from "react";
import axios from "axios";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/* ---------- constants ---------- */
const STEPS = ["Personal Info", "Company Details", "Rounds", "Feedback"];
const TIMELINE_OPTIONS = ["≤ 1 week", "2 weeks", "3 weeks", "1 month", "> 1 month"];
const APPLY_OPTIONS = ["Referral", "On-Campus", "Off-Campus", "Other"];
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i;
const linkedinRegex = /^https:\/\/(www\.)?linkedin\.com\/in\/[A-Za-z0-9_-]+\/?$/;

const EMPTY = {
  name: "", email: "", experience: "0–1 years", role: "", linkedin: "",
  company: "", roleApplied: "", difficulty: "", mode: "", applicationMode: "",
  timeline: "", salary: "",
  rounds: [{ name: "", duration: "", mode: "", codingProblems: 0, description: "" }],
  result: "", tips: "", advice: "", content: "",
};

export default function ExperienceForm({ isAnonymous }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const input = "w-full px-4 py-2 border border-gray-300 rounded focus:outline-blue-400";

  const validate = () => {
    const e = {};
    if (step === 0 && !isAnonymous) {
      if (!form.name.trim()) e.name = "Required";
      if (!emailRegex.test(form.email)) e.email = "Invalid email";
      if (!form.linkedin.trim()) e.linkedin = "Required";
      else if (!linkedinRegex.test(form.linkedin)) e.linkedin = "Invalid LinkedIn URL";
    }
    if (step === 1) {
      if (!form.company.trim()) e.company = "Required";
      if (!form.roleApplied.trim()) e.roleApplied = "Required";
      if (!form.difficulty) e.difficulty = "Choose difficulty";
      if (!form.mode) e.mode = "Select interview mode";
      if (!form.applicationMode) e.applicationMode = "Select source";
      if (!form.timeline) e.timeline = "Select timeline";
    }
    if (step === 2) {
      if (form.rounds.length === 0) e.rounds = "Add at least one round";
      form.rounds.forEach((r, i) => {
        if (!r.name.trim()) e[`round-${i}-name`] = "Name required";
        if (!r.description.trim()) e[`round-${i}-description`] = "Description required";
      });
    }
    if (step === 3 && !form.result.trim()) e.result = "Required";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const setField = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const setRoundField = (i, key, val) => {
    const rounds = [...form.rounds];
    rounds[i][key] = key === "codingProblems" ? Number(val) : val;
    setForm({ ...form, rounds });
  };

  const addRound = () =>
    setForm({
      ...form,
      rounds: [...form.rounds, { name: "", duration: "", mode: "", codingProblems: 0, description: "" }],
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step < STEPS.length - 1) {
      if (validate()) setStep((s) => s + 1);
      return;
    }

    if (!validate()) return;

    const payload = {
      ...form,
      anonymous: isAnonymous,
      preparationTips: form.tips?.split("\n").filter(Boolean) ?? [],
      generalAdvice: form.advice?.split("\n").filter(Boolean) ?? [],
    };
    if (isAnonymous) {
      delete payload.name;
      delete payload.email;
      delete payload.linkedin;
    }
    delete payload.tips;
    delete payload.advice;
    delete payload.result;

    try {
      const token = await auth.currentUser?.getIdToken();
      await axios.post("http://localhost:5000/interview", payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      toast.success("Submitted for review! ✅", { autoClose: 1500 });
      setForm(EMPTY);
      setStep(0);
      setErrors({});
      navigate("/");
    } catch (err) {
      console.error(err);
      toast.error("Submission failed. Please try again.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto bg-white rounded-lg shadow p-8 space-y-8 animate-fadeInUp"
    >
       {/* progress bar */}
      <div className="relative flex items-center justify-between mb-8 px-4">
        <div className="absolute top-4 left-0 right-0 h-1 bg-gray-300" />
        <div
          className="absolute top-4 left-0 h-1 bg-blue-600 transition-all"
          style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
        />
        {STEPS.map((lbl, idx) => (
          <div key={idx} className="relative flex flex-col items-center w-1/4 z-10">
            <div
              className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold border-2 ${
                idx < step
                  ? "bg-blue-600 text-white border-blue-600"
                  : idx === step
                  ? "bg-white text-blue-600 border-blue-600"
                  : "bg-gray-200 text-gray-500 border-gray-300"
              }`}
            >
              {idx < step ? "✓" : idx + 1}
            </div>
            <p
              className={`text-xs mt-1 ${
                idx === step ? "text-blue-600 font-semibold" : idx < step ? "text-blue-500" : "text-gray-400"
              }`}
            >
              {lbl}
            </p>
          </div>
        ))}
      </div>

      {/* STEP 0 – Personal Info */}
      {step === 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {!isAnonymous && (
            <>
              <div>
                <input name="name" placeholder="Full Name" value={form.name} onChange={setField} className={input} />
                {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
              </div>
              <div>
                <input name="email" type="email" placeholder="Email" value={form.email} onChange={setField} className={input} />
                {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
              </div>
              <input
                name="linkedin"
                type="url"

                placeholder="LinkedIn URL"
                value={form.linkedin}
                onChange={setField}
                className={`${input} md:col-span-2`}
              />
              {errors.linkedin && <p className="text-red-500 text-xs">{errors.linkedin}</p>}
            </>
          )}

          <select name="experience" value={form.experience} onChange={setField} className={input}>
            <option>0–1 years</option>
            <option>1–2 years</option>
            <option>2+ years</option>
          </select>
          <input name="role" placeholder="Current Role" value={form.role} onChange={setField} className={input} />
        </div>
      )}

      {/* STEP 1 – Company Details */}
      {step === 1 && (
        <div className="grid gap-4 md:grid-cols-2">
          <input name="company" placeholder="Company Name" value={form.company} onChange={setField} className={input} />
          <input name="roleApplied" placeholder="Role Applied For" value={form.roleApplied} onChange={setField} className={input} />

          <select name="difficulty" value={form.difficulty} onChange={setField} className={input}>
            <option value="">Difficulty</option>
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>

          <select name="mode" value={form.mode} onChange={setField} className={input}>
            <option value="">Interview Mode</option>
            <option value="Online">Online</option>
            <option value="Offline">Offline</option>
            <option value="Hybrid">Hybrid</option>
          </select>
          {errors.mode && <p className="text-red-500 text-xs md:col-span-2">{errors.mode}</p>}

          <select name="applicationMode" value={form.applicationMode} onChange={setField} className={input}>
            <option value="">Application Source</option>
            {APPLY_OPTIONS.map((opt) => (
              <option key={opt}>{opt}</option>
            ))}
          </select>
          {errors.applicationMode && <p className="text-red-500 text-xs">{errors.applicationMode}</p>}

          <select name="timeline" value={form.timeline} onChange={setField} className={input}>
            <option value="">Timeline</option>
            {TIMELINE_OPTIONS.map((opt) => (
              <option key={opt}>{opt}</option>
            ))}
          </select>
          {errors.timeline && <p className="text-red-500 text-xs">{errors.timeline}</p>}

          <input name="salary" placeholder="Offered Salary (optional)" value={form.salary} onChange={setField} className={input} />
        </div>
      )}

      {/* STEP 2 – Rounds */}
      {step === 2 && (
        <div className="space-y-6">
          {form.rounds.map((r, i) => (
            <div key={i} className="border rounded p-4 space-y-2">
              <input placeholder="Round Name" value={r.name} onChange={(e) => setRoundField(i, "name", e.target.value)} className={input} />
              <input placeholder="Duration" value={r.duration} onChange={(e) => setRoundField(i, "duration", e.target.value)} className={input} />
              <select value={r.mode} onChange={(e) => setRoundField(i, "mode", e.target.value)} className={input}>
                <option value="">Mode</option>
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
              </select>
              <label className="block text-sm font-medium text-gray-700">Number of Coding Problems</label>
              <input
                type="number"
                value={r.codingProblems}
                onChange={(e) => setRoundField(i, "codingProblems", e.target.value)}
                className={input}
              />
              <textarea
                placeholder="Description"
                value={r.description}
                onChange={(e) => setRoundField(i, "description", e.target.value)}
                className={input}
                rows={3}
              />
              {errors[`round-${i}-name`] && <p className="text-red-500 text-xs">{errors[`round-${i}-name`]}</p>}
              {errors[`round-${i}-description`] && <p className="text-red-500 text-xs">{errors[`round-${i}-description`]}</p>}
            </div>
          ))}
          <button type="button" onClick={addRound} className="text-blue-600 hover:underline font-semibold">
            + Add Round
          </button>
        </div>
      )}

      {/* STEP 3 – Feedback */}
      {step === 3 && (
        <div className="grid gap-4">
          <label className="block text-sm font-medium text-gray-700">Final Result</label>
          <select name="result" value={form.result} onChange={setField} className={input}>
            <option value="">Select Result</option>
            <option value="Accepted">Accepted</option>
            <option value="Rejected">Rejected</option>
            <option value="Pending">Pending</option>
          </select>
          {errors.result && <p className="text-red-500 text-xs">{errors.result}</p>}

          <textarea
            name="tips"
            placeholder="Preparation Tips (one per line)"
            value={form.tips}
            onChange={setField}
            rows={4}
            className={input}
          />
          <textarea
            name="advice"
            placeholder="General Advice (one per line)"
            value={form.advice}
            onChange={setField}
            rows={4}
            className={input}
          />
          <textarea
            name="content"
            placeholder="Additional Content (optional)"
            value={form.content}
            onChange={setField}
            rows={4}
            className={input}
          />
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex justify-between pt-6">
        {step > 0 && (
          <button type="button" onClick={() => setStep((s) => s - 1)} className="px-5 py-2 border rounded border-gray-400 hover:bg-gray-100">
            Back
          </button>
        )}

        {step < STEPS.length - 1 ? (
          <button type="submit" className="ml-auto px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Next
          </button>
        ) : (
          <button type="submit" className="ml-auto px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            Submit
          </button>
        )}
      </div>
    </form>
  );
}
