import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/api"; // handled separately
import { Loader2, LogIn } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
     try {
     setLoading(true);
     const { token, refresh_token, user } = await loginUser(formData); 
     // 'user' is an object here, which AuthContext will now correctly stringify
     login(user, token, refresh_token) 
     navigate("/"); // This is where the redirect happens
     location.reload()
     } catch (err) {
     setError("Invalid email or password");
     } finally {
      setLoading(false);
     }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Welcome Back 👋
        </h1>

        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            type="email"
          />

          <Input
            label="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            type="password"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white py-2.5 rounded-xl hover:bg-blue-600 transition disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <LogIn size={18} />
            )}
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          Don’t have an account?{" "}
          <a href="/register" className="text-blue-500 hover:underline">
            Register
          </a>
        </p>

        <p className="text-center text-xs text-gray-400 mt-3">
          Forgotten your password?{" "}
          <a href="/forgot-password" className="text-blue-400 hover:underline">
            Reset it
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
        required
        className="w-full border border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-400"
      />
    </div>
  );
}