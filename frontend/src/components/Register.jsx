import { useState, useEffect } from "react";
import { registerUser, getPublicSchools } from "../services/api"; 
import { Loader2, UserPlus, School as SchoolIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "student",
    age: "",
    grade: "",
    section: "",
    school_id: "", // Now using ID instead of string name
    city: "",
    interests: "",
    childEmail: "",
    childPassword: "",
    handling_classes: "",
    designation: "", 
    bio: ""
  });

  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingSchools, setFetchingSchools] = useState(true);
  const [error, setError] = useState("");

  // Fetch registered schools on load
  useEffect(() => {
    async function loadSchools() {
      try {
        const data = await getPublicSchools();
        setSchools(data);
      } catch (err) {
        console.error("Could not load schools list");
      } finally {
        setFetchingSchools(false);
      }
    }
    loadSchools();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }

    // Validation: Ensure a school is selected for non-admins
    if (formData.userType !== "school_admin" && !formData.school_id) {
        return setError("Please select your school from the list.");
    }

    try {
      setLoading(true);
      await registerUser(formData);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-10">
      <div className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-lg border border-white/50 backdrop-blur-sm">
        <div className="flex flex-col items-center mb-6">
            <div className="bg-blue-500 p-3 rounded-2xl text-white mb-4 shadow-lg shadow-blue-200">
                <SchoolIcon size={28} />
            </div>
            <h1 className="text-2xl font-black text-gray-800 tracking-tighter">
                BrightPathAI
            </h1>
            <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">Join the ecosystem</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm font-medium animate-pulse">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* User Type */}
          <div>
            <label className="block text-xs font-black uppercase text-gray-400 mb-1 ml-1">Account Type</label>
            <select
              name="userType"
              value={formData.userType}
              onChange={handleChange}
              className="w-full border-2 border-gray-100 bg-gray-50 rounded-2xl p-3 outline-none focus:border-blue-400 focus:bg-white transition-all font-bold text-gray-700 appearance-none"
            >
              <option value="student">Student</option>
              <option value="parent">Parent</option>
              <option value="teacher">Teacher</option>
              <option value="school_admin">School Admin</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} />
            <Input label="Email Address" name="email" value={formData.email} onChange={handleChange} type="email" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Password" name="password" value={formData.password} onChange={handleChange} type="password" />
            <Input label="Confirm" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} type="password" />
          </div>

          {/* SCHOOL SELECTOR (For Students & Teachers) */}
          {(formData.userType === "student" || formData.userType === "teacher") && (
            <div>
              <label className="block text-xs font-black uppercase text-gray-400 mb-1 ml-1">Select Your School</label>
              <select
                name="school_id"
                value={formData.school_id}
                onChange={handleChange}
                disabled={fetchingSchools}
                className="w-full border-2 border-gray-100 bg-gray-50 rounded-2xl p-3 outline-none focus:border-blue-400 focus:bg-white transition-all font-bold text-gray-700 appearance-none"
                required
              >
                <option value="">{fetchingSchools ? "Loading schools..." : "-- Choose from list --"}</option>
                {schools.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.unique_code})</option>
                ))}
              </select>
              <p className="text-[10px] text-gray-400 mt-2 ml-1 italic">School not listed? Contact your administrator.</p>
            </div>
          )}

          {formData.userType === "student" && (
            <>
              <div className="grid grid-cols-3 gap-4">
                <Input label="Grade" name="grade" value={formData.grade} onChange={handleChange} />
                <Input label="Section" name="section" value={formData.section} onChange={handleChange} />
                <Input label="Age" name="age" value={formData.age} onChange={handleChange} />
              </div>
              <Input label="City" name="city" value={formData.city} onChange={handleChange} />
            </>
          )}
          
          {formData.userType === "teacher" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Department" name="designation" value={formData.designation} onChange={handleChange} placeholder="e.g. Science" />
                <Input label="Age" name="age" value={formData.age} onChange={handleChange} />
              </div>
              <Input label="City" name="city" value={formData.city} onChange={handleChange} />
            </>
          )}

          {formData.userType === "school_admin" && (
            <>
              <div>
              <label className="block text-xs font-black uppercase text-gray-400 mb-1 ml-1">Select Your School</label>
              <select
                name="school_id"
                value={formData.school_id}
                onChange={handleChange}
                disabled={fetchingSchools}
                className="w-full border-2 border-gray-100 bg-gray-50 rounded-2xl p-3 outline-none focus:border-blue-400 focus:bg-white transition-all font-bold text-gray-700 appearance-none"
                required
              >
                <option value="">{fetchingSchools ? "Loading schools..." : "-- Choose from list --"}</option>
                {schools.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.unique_code})</option>
                ))}
              </select>
              <p className="text-[10px] text-gray-400 mt-2 ml-1 italic">School not listed? Contact your administrator.</p>
            </div>
              <Input label="Designation" name="designation" value={formData.designation} onChange={handleChange} placeholder="Principal / IT Head" />
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all active:scale-95 disabled:opacity-50 mt-4"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <UserPlus size={20} />}
            {loading ? "Processing..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-xs font-bold text-gray-400 mt-6 uppercase tracking-wider">
          Got an account?{" "}
          <a href="/login" className="text-blue-600 hover:underline">Sign In</a>
        </p>
      </div>
    </div>
  );
}

function Input({ label, name, value, onChange, type = "text", placeholder = "" }) {
  return (
    <div>
      <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 ml-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full border-2 border-gray-100 bg-gray-50 rounded-2xl p-3 outline-none focus:border-blue-400 focus:bg-white transition-all font-bold text-gray-700"
        required
      />
    </div>
  );
}
