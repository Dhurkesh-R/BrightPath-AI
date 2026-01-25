import { useState } from "react";
import { registerUser } from "../services/api"; // handled separately
import { Loader2, UserPlus } from "lucide-react";
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
    class: "",
    school: "",
    city: "",
    interests: "",
    childEmail: "",
    childPassword: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }

    try {
      setLoading(true);
      result = await registerUser(formData);
      navigate("/login");
    } catch (err) {
      console.error(result);
      setError("Registration failed. Try again!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-lg">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Create Your Account
        </h1>

        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User Type */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">User Type</label>
            <select
              name="userType"
              value={formData.userType}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="student">Student</option>
              <option value="parent">Parent</option>
              <option value="teacher">Teacher</option>
              <option value="school_admin">School Admin</option>
            </select>
          </div>
          {/* Basic Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} />
            <Input label="Email" name="email" value={formData.email} onChange={handleChange} type="email" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Password" name="password" value={formData.password} onChange={handleChange} type="password" />
            <Input label="Confirm Password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} type="password" />
          </div>

          {formData.userType === "student" && (
            <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Age" name="age" value={formData.age} onChange={handleChange} />
              <Input label="Class" name="class" value={formData.class} onChange={handleChange} />
            </div>

            <Input label="School" name="school" value={formData.school} onChange={handleChange} />
            <Input label="City" name="city" value={formData.city} onChange={handleChange} />
            <div>
              <label className="block text-sm text-gray-600 mb-1">Interests / Skills</label>
              <textarea
                name="interests"
                value={formData.interests}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-400 min-h-[80px]"
                placeholder="e.g., Drawing, Coding, Football..."
                />
            </div>
            </>
          )}
          
          {formData.userType === "teacher" && (
            <>
            <Input label="Age" name="age" value={formData.age} onChange={handleChange} />
            <Input label="School" name="school" value={formData.school} onChange={handleChange} />
            <Input label="City" name="city" value={formData.city} onChange={handleChange} />
            <div>
              <label className="block text-sm text-gray-600 mb-1">Handling Classes</label>
              <textarea
                name="handling_classes"
                value={formData.handling_classes}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-400 min-h-[80px]"
                placeholder="e.g., Drawing, Coding, Football..."
              />
            </div>
            </>
          )}

          {formData.userType === "parent" && (
            <>
              <Input label="Child Email" name="childEmail" value={formData.childEmail} onChange={handleChange} />
              <Input label="Child Password" name="childPassword" value={formData.childPassword} onChange={handleChange} />
            </>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white py-2.5 rounded-xl hover:bg-blue-600 transition disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <UserPlus size={18} />
            )}
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-blue-500 hover:underline">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}

/* Reusable Input Component */
function Input({ label, name, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="block text-sm text-gray-600 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-400"
        required
      />
    </div>
  );
}
