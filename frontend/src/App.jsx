import React, { useState, useEffect, useContext, createContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate,
} from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Droplet,
  Menu,
  X,
  User,
  LogOut,
  Search,
  MapPin,
  Phone,
  Heart,
  Users,
  Activity,
  Bell,
  Loader2,
  Mail,
  Lock,
  Home as HomeIcon,
  Info,
  PhoneCall,
  ShieldCheck,
  UserPlus,
  CheckCircle,
  Globe,
  
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* API SETUP                                                          */
/* ------------------------------------------------------------------ */
const API_BASE_URL = "http://localhost:5000/api";

const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ------------------------------------------------------------------ */
/* AUTH CONTEXT                                                       */
/* ------------------------------------------------------------------ */
const AuthContext = createContext(null);
const useAuth = () => useContext(AuthContext);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password, rememberMe) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      const { token, user: userData } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      if (rememberMe) localStorage.setItem("rememberMe", "true");
      setUser(userData);
      toast.success("Login successful! Welcome back.");
      return true;
    } catch (err) {
      toast.error(err?.response?.data?.message || "Invalid email or password.");
      return false;
    }
  };

  const register = async (formData) => {
    try {
      const res = await api.post("/auth/register", formData);
      const { token, user: userData } = res.data;
      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
      }
      toast.success("Registration successful! Welcome aboard.");
      return true;
    } catch (err) {
      toast.error(err?.response?.data?.message || "Registration failed. Try again.");
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    toast.info("You have been logged out.");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/* PROTECTED ROUTE                                                    */
/* ------------------------------------------------------------------ */
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner full />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

/* ------------------------------------------------------------------ */
/* SHARED UI COMPONENTS                                                */
/* ------------------------------------------------------------------ */
function Spinner({ full }) {
  return (
    <div
      className={`flex items-center justify-center ${
        full ? "min-h-[60vh]" : "py-10"
      }`}
    >
      <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
    </div>
  );
}

function EmergencyBanner() {
  return (
    <div className="bg-red-700 text-white text-sm md:text-base py-2 px-4 flex items-center justify-center gap-2 text-center">
      <Bell className="w-4 h-4 flex-shrink-0 animate-pulse" />
      <span>
        Emergency: O- blood urgently needed in City Hospital.{" "}
        <Link to="/find-donors" className="underline font-semibold">
          Find donors now
        </Link>
      </span>
    </div>
  );
}

function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const links = [
    { name: "Home", path: "/", icon: HomeIcon },
    { name: "Find Donors", path: "/find-donors", icon: Search },
    { name: "Become Donor", path: "/become-donor", icon: Heart },
    { name: "About", path: "/about", icon: Info },
    { name: "Contact", path: "/contact", icon: PhoneCall },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
    setOpen(false);
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 text-red-600 font-bold text-xl">
            <Droplet className="w-7 h-7 fill-red-600" />
            Blood Donor Finder
          </Link>

          <div className="hidden lg:flex items-center gap-6">
            {links.map((l) => (
              <Link
                key={l.path}
                to={l.path}
                className="text-gray-700 hover:text-red-600 font-medium transition-colors"
              >
                {l.name}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-red-600 font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-red-600 font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          <button className="lg:hidden text-gray-700" onClick={() => setOpen(!open)}>
            {open ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>

        {open && (
          <div className="lg:hidden pb-4 flex flex-col gap-3">
            {links.map((l) => (
              <Link
                key={l.path}
                to={l.path}
                onClick={() => setOpen(false)}
                className="text-gray-700 hover:text-red-600 font-medium py-1"
              >
                {l.name}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setOpen(false)}
                  className="text-gray-700 hover:text-red-600 font-medium py-1"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 bg-red-600 text-white px-4 py-2 rounded-lg justify-center"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="text-gray-700 hover:text-red-600 font-medium py-1"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg text-center"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 text-white font-bold text-lg mb-3">
            <Droplet className="w-6 h-6 text-red-500 fill-red-500" />
            Blood Donor Finder
          </div>
          <p className="text-sm text-gray-400">
            Connecting blood donors with recipients to save lives, one donation at a time.
          </p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-red-500">Home</Link></li>
            <li><Link to="/find-donors" className="hover:text-red-500">Find Donors</Link></li>
            <li><Link to="/become-donor" className="hover:text-red-500">Become a Donor</Link></li>
            <li><Link to="/about" className="hover:text-red-500">About Us</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Support</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/contact" className="hover:text-red-500">Contact Us</Link></li>
            <li><Link to="/login" className="hover:text-red-500">Login</Link></li>
            <li><Link to="/register" className="hover:text-red-500">Register</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Follow Us</h4>
          <div className="flex gap-4">
            <Globe className="w-5 h-5 hover:text-red-500 cursor-pointer" />
<Mail className="w-5 h-5 hover:text-red-500 cursor-pointer" />
<Phone className="w-5 h-5 hover:text-red-500 cursor-pointer" />
          </div>
        </div>
      </div>
      <div className="border-t border-gray-800 text-center text-sm text-gray-500 py-4">
        © {new Date().getFullYear()} Blood Donor Finder. All rights reserved.
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/* HOME PAGE                                                           */
/* ------------------------------------------------------------------ */
function Home() {
  const stats = [
    { label: "Registered Donors", value: "12,500+", icon: Users },
    { label: "Lives Saved", value: "8,300+", icon: Heart },
    { label: "Cities Covered", value: "150+", icon: MapPin },
    { label: "Active Requests", value: "42", icon: Activity },
  ];

  const features = [
    {
      icon: Search,
      title: "Find Donors Instantly",
      desc: "Search by blood group, city, or state to find matching donors within seconds.",
    },
    {
      icon: ShieldCheck,
      title: "Verified Profiles",
      desc: "All donors go through a verification process to ensure trust and safety.",
    },
    {
      icon: Bell,
      title: "Emergency Alerts",
      desc: "Get notified instantly when there is an urgent blood requirement nearby.",
    },
    {
      icon: UserPlus,
      title: "Easy Registration",
      desc: "Sign up as a donor in minutes and start saving lives in your community.",
    },
  ];

  const reasons = [
    "One donation can save up to three lives.",
    "Blood cannot be manufactured, only donated.",
    "Regular donation helps maintain healthy iron levels.",
    "Donating blood is safe, quick, and free.",
  ];

  return (
    <div>
      <EmergencyBanner />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-red-600 to-red-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              Every Drop Counts. Be Someone's Lifeline.
            </h1>
            <p className="text-lg text-red-100 mb-8">
              Connect with verified blood donors near you in seconds, or register
              to become a donor and help save lives in your community.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/find-donors"
                className="bg-white text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Find Donors
              </Link>
              <Link
                to="/become-donor"
                className="border-2 border-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-red-600 transition-colors"
              >
                Become a Donor
              </Link>
            </div>
          </div>
          <div className="flex justify-center">
            <Droplet className="w-64 h-64 text-white/20 fill-white/20" />
          </div>
        </div>
      </section>

      {/* Statistics Cards */}
      <section className="max-w-7xl mx-auto px-4 -mt-10 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-xl shadow-lg p-6 text-center border-t-4 border-red-600"
            >
              <s.icon className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-800">{s.value}</div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-3">
          Why Choose Blood Donor Finder
        </h2>
        <p className="text-center text-gray-500 mb-12 max-w-2xl mx-auto">
          A simple, fast, and reliable platform to connect donors and recipients.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition-shadow border border-gray-100"
            >
              <div className="bg-red-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <f.icon className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Donate Blood */}
      <section className="bg-red-50 py-16">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Why Donate Blood?</h2>
            <ul className="space-y-3">
              {reasons.map((r) => (
                <li key={r} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{r}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/become-donor"
              className="inline-block mt-6 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Register as Donor
            </Link>
          </div>
          <div className="flex justify-center">
            <Heart className="w-56 h-56 text-red-200 fill-red-200" />
          </div>
        </div>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* REGISTER PAGE                                                       */
/* ------------------------------------------------------------------ */
function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    bloodGroup: "",
    age: "",
    gender: "",
    phone: "",
    city: "",
    state: "",
    address: "",
    userType: "Donor",
  });

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setLoading(true);
    const success = await register(form);
    setLoading(false);
    if (success) navigate("/dashboard");
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-white shadow-lg rounded-xl p-8 border-t-4 border-red-600">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Create an Account</h2>
        <p className="text-gray-500 mb-6">Join our community and start saving lives.</p>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
          <Input label="Full Name" name="name" value={form.name} onChange={handleChange} required />
          <Input label="Email" type="email" name="email" value={form.email} onChange={handleChange} required />
          <Input label="Password" type="password" name="password" value={form.password} onChange={handleChange} required />
          <Input label="Confirm Password" type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required />

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Blood Group</label>
            <select
              name="bloodGroup"
              value={form.bloodGroup}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:outline-none"
            >
              <option value="">Select Blood Group</option>
              {bloodGroups.map((bg) => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>

          <Input label="Age" type="number" name="age" value={form.age} onChange={handleChange} required />

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Gender</label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:outline-none"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <Input label="Phone Number" name="phone" value={form.phone} onChange={handleChange} required />
          <Input label="City" name="city" value={form.city} onChange={handleChange} required />
          <Input label="State" name="state" value={form.state} onChange={handleChange} required />

          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Address</label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              rows="2"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700 mb-2 block">User Type</label>
            <div className="flex gap-4">
              {["Donor", "Recipient"].map((type) => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="userType"
                    value={type}
                    checked={form.userType === type}
                    onChange={handleChange}
                    className="accent-red-600"
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Register
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-red-600 font-medium hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 mb-1 block">{label}</label>
      <input
        {...props}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:outline-none"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* LOGIN PAGE                                                          */
/* ------------------------------------------------------------------ */
function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", rememberMe: false });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(form.email, form.password, form.rememberMe);
    setLoading(false);
    if (success) navigate("/dashboard");
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white shadow-lg rounded-xl p-8 border-t-4 border-red-600">
        <div className="text-center mb-6">
          <Droplet className="w-12 h-12 text-red-600 fill-red-600 mx-auto mb-2" />
          <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
          <p className="text-gray-500">Login to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer text-gray-600">
              <input
                type="checkbox"
                name="rememberMe"
                checked={form.rememberMe}
                onChange={handleChange}
                className="accent-red-600"
              />
              Remember Me
            </label>
            <Link to="/forgot-password" className="text-red-600 hover:underline">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Login
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Don't have an account?{" "}
          <Link to="/register" className="text-red-600 font-medium hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    toast.success("If an account exists, a reset link has been sent.");
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white shadow-lg rounded-xl p-8 border-t-4 border-red-600">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Reset Password</h2>
        <p className="text-gray-500 mb-6">Enter your email to receive a reset link.</p>
        {sent ? (
          <div className="text-center text-green-600 flex flex-col items-center gap-2">
            <CheckCircle className="w-10 h-10" />
            Check your inbox for the reset link.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <button type="submit" className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors">
              Send Reset Link
            </button>
          </form>
        )}
        <p className="text-center text-sm text-gray-500 mt-4">
          <Link to="/login" className="text-red-600 font-medium hover:underline">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* DASHBOARD PAGE                                                      */
/* ------------------------------------------------------------------ */
function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    totalDonors: 0,
    availableDonors: 0,
    bloodRequests: 0,
  });
  const [activities, setActivities] = useState([]);
const handleRemoveDonor = async () => {
  try {
    await api.delete("/donors");

    toast.success("Donor removed successfully.");

    window.location.reload();
  } catch (err) {
    toast.error(err.response?.data?.message || "Failed to remove donor.");
  }
};
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [profileRes, donorsRes] = await Promise.all([
          api.get("/profile"),
          api.get("/donors"),
        ]);
        setProfile(profileRes.data);
        const donors = donorsRes.data?.donors || donorsRes.data || [];
        setStats({
          totalDonors: donors.length,
          availableDonors: donors.length,
          bloodRequests: donorsRes.data?.bloodRequests || 0,
        });
        setActivities(donorsRes.data?.recentActivities || []);
      } catch (err) {
        toast.error("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <Spinner full />;

  const statCards = [
    { label: "Total Donors", value: stats.totalDonors, icon: Users },
    { label: "Available Donors", value: stats.availableDonors, icon: CheckCircle },
    { label: "Blood Requests", value: stats.bloodRequests, icon: Activity },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">
        Welcome back, {user?.fullName || profile?.fullName || "Friend"}!
      </h1>
      <p className="text-gray-500 mb-8">Here's what's happening in your community today.</p>
      <div className="mb-6">
  <button
    onClick={handleRemoveDonor}
    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
  >
    Remove Donor
  </button>
</div>
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white rounded-xl shadow p-6 flex items-center gap-4 border-l-4 border-red-600">
            <div className="bg-red-100 p-3 rounded-lg">
              <s.icon className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{s.value}</div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Recent Activities</h2>
          {activities.length === 0 ? (
            <p className="text-sm text-gray-400">No recent activity to show.</p>
          ) : (
            <ul className="space-y-3">
              {activities.map((a, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-600 border-b pb-3 last:border-0">
                  <Activity className="w-4 h-4 text-red-600 mt-0.5" />
                  {a.description || a}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Profile Summary</h2>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-red-100 p-3 rounded-full">
              <User className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <div className="font-medium text-gray-800">
                {user?.fullName || profile?.fullName || "N/A"}
              </div>
              <div className="text-sm text-gray-500">{user?.email || profile?.email}</div>
            </div>
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Blood Group: <span className="font-medium">{profile?.bloodGroup || "N/A"}</span></p>
            <p>City: <span className="font-medium">{profile?.city || "N/A"}</span></p>
            <p>Type: <span className="font-medium">{profile?.userType || "N/A"}</span></p>
          </div>
          <Link
            to="/profile"
            className="inline-block mt-4 text-red-600 font-medium text-sm hover:underline"
          >
            View Full Profile →
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* FIND DONORS PAGE                                                    */
/* ------------------------------------------------------------------ */
function DonorCard({ donor }) {
  return (
    <div className="bg-white rounded-xl shadow p-5 border border-gray-100 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="bg-red-100 p-3 rounded-full">
            <User className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{donor.name}</h3>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {donor.city}
            </p>
          </div>
        </div>
        <span className="bg-red-600 text-white text-sm font-bold px-3 py-1 rounded-full">
          {donor.bloodGroup}
        </span>
      </div>

      <div className="flex items-center justify-between text-sm mb-4">
        <span className="flex items-center gap-1 text-gray-600">
          <Phone className="w-4 h-4" /> {donor.phone}
        </span>
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            donor.availability
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {donor.availability ? "Available" : "Unavailable"}
        </span>
      </div>

      <button
        onClick={() => toast.info(`Contacting ${donor.name}...`)}
        disabled={!donor.availability}
        className="w-full bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Contact
      </button>
    </div>
  );
}

function FindDonors() {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ bloodGroup: "", city: "", state: "" });

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  const fetchDonors = async (params = {}) => {
    setLoading(true);
    try {
      const res = await api.get("/donors", { params });
      setDonors(res.data?.donors || res.data || []);
    } catch (err) {
      toast.error("Failed to fetch donors.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDonors(filters);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Find Blood Donors</h1>
      <p className="text-gray-500 mb-6">Search for available donors in your area.</p>

      <form
        onSubmit={handleSearch}
        className="bg-white rounded-xl shadow p-5 grid md:grid-cols-4 gap-4 mb-8"
      >
        <select
          value={filters.bloodGroup}
          onChange={(e) => setFilters({ ...filters, bloodGroup: e.target.value })}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:outline-none"
        >
          <option value="">All Blood Groups</option>
          {bloodGroups.map((bg) => (
            <option key={bg} value={bg}>{bg}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="City"
          value={filters.city}
          onChange={(e) => setFilters({ ...filters, city: e.target.value })}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:outline-none"
        />

        <input
          type="text"
          placeholder="State"
          value={filters.state}
          onChange={(e) => setFilters({ ...filters, state: e.target.value })}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:outline-none"
        />

        <button
          type="submit"
          className="bg-red-600 text-white rounded-lg px-4 py-2 font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
        >
          <Search className="w-4 h-4" /> Search
        </button>
      </form>

      {loading ? (
        <Spinner />
      ) : donors.length === 0 ? (
        <p className="text-center text-gray-400 py-10">No donors found matching your criteria.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {donors.map((d, i) => (
            <DonorCard key={d.id || i} donor={d} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* BECOME DONOR PAGE                                                   */
/* ------------------------------------------------------------------ */
function BecomeDonor() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    bloodGroup: "",
    age: "",
    gender: "",
    phone: "",
    city: "",
    state: "",
    address: "",
    availability: true,
  });

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/donors", form);
      toast.success("Thank you! You are now registered as a donor.");
      setForm({
        name: "",
        bloodGroup: "",
        age: "",
        gender: "",
        phone: "",
        city: "",
        state: "",
        address: "",
        availability: true,
      });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to register as donor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <Heart className="w-12 h-12 text-red-600 fill-red-600 mx-auto mb-2" />
        <h1 className="text-2xl font-bold text-gray-800">Become a Blood Donor</h1>
        <p className="text-gray-500">Fill out the form below to register as a donor.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-xl p-8 border-t-4 border-red-600 grid md:grid-cols-2 gap-4">
        <Input label="Full Name" name="name" value={form.name} onChange={handleChange} required />

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Blood Group</label>
          <select
            name="bloodGroup"
            value={form.bloodGroup}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:outline-none"
          >
            <option value="">Select Blood Group</option>
            {bloodGroups.map((bg) => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>
        </div>

        <Input label="Age" type="number" name="age" value={form.age} onChange={handleChange} required />

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Gender</label>
          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:outline-none"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <Input label="Phone Number" name="phone" value={form.phone} onChange={handleChange} required />
        <Input label="City" name="city" value={form.city} onChange={handleChange} required />
        <Input label="State" name="state" value={form.state} onChange={handleChange} required />

        <div className="md:col-span-2">
          <label className="text-sm font-medium text-gray-700 mb-1 block">Address</label>
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            rows="2"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:outline-none"
          />
        </div>

        <div className="md:col-span-2">
          <label className="flex items-center gap-2 cursor-pointer text-gray-700">
            <input
              type="checkbox"
              name="availability"
              checked={form.availability}
              onChange={handleChange}
              className="accent-red-600"
            />
            I am currently available to donate
          </label>
        </div>

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Register as Donor
          </button>
        </div>
      </form>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* ABOUT PAGE                                                          */
/* ------------------------------------------------------------------ */
function About() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">About Us</h1>
      <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">
        Blood Donor Finder is a platform dedicated to bridging the gap between
        blood donors and recipients, making it easier and faster to save lives.
      </p>
      <div className="grid md:grid-cols-3 gap-8 text-center">
        <div className="bg-white rounded-xl shadow p-6">
          <Heart className="w-10 h-10 text-red-600 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-800 mb-2">Our Mission</h3>
          <p className="text-sm text-gray-500">
            To ensure no one suffers due to lack of access to safe blood.
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <Users className="w-10 h-10 text-red-600 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-800 mb-2">Our Community</h3>
          <p className="text-sm text-gray-500">
            Thousands of verified donors ready to help across the country.
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <ShieldCheck className="w-10 h-10 text-red-600 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-800 mb-2">Our Promise</h3>
          <p className="text-sm text-gray-500">
            Safe, verified, and transparent connections every single time.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* CONTACT PAGE                                                        */
/* ------------------------------------------------------------------ */
function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast.success("Message sent! We'll get back to you soon.");
      setForm({ name: "", email: "", message: "" });
    }, 1200);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">Contact Us</h1>
      <p className="text-gray-500 text-center mb-8">
        Have a question or need help? Reach out to our team.
      </p>
      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-xl p-8 border-t-4 border-red-600 space-y-4">
        <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Message</label>
          <textarea
            rows="4"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={sending}
          className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {sending && <Loader2 className="w-4 h-4 animate-spin" />}
          Send Message
        </button>
      </form>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* PROFILE PAGE                                                        */
/* ------------------------------------------------------------------ */
function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await api.get("/profile");
        setProfile(res.data);
      } catch (err) {
        toast.error("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <Spinner full />;

  const data = profile || user || {};

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-white shadow-lg rounded-xl p-8 border-t-4 border-red-600">
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-red-100 p-5 rounded-full">
            <User className="w-10 h-10 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{data.fullName || data.name || "N/A"}</h1>
            <p className="text-gray-500">{data.email || "N/A"}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <ProfileField label="Blood Group" value={data.bloodGroup} />
          <ProfileField label="Age" value={data.age} />
          <ProfileField label="Gender" value={data.gender} />
          <ProfileField label="Phone" value={data.phone} />
          <ProfileField label="City" value={data.city} />
          <ProfileField label="State" value={data.state} />
          <ProfileField label="User Type" value={data.userType} />
          <ProfileField label="Address" value={data.address} />
        </div>
      </div>
    </div>
  );
}

function ProfileField({ label, value }) {
  return (
    <div className="border border-gray-100 rounded-lg p-3 bg-gray-50">
      <div className="text-gray-400 text-xs uppercase tracking-wide mb-1">{label}</div>
      <div className="font-medium text-gray-800">{value || "N/A"}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* NOT FOUND PAGE                                                      */
/* ------------------------------------------------------------------ */
function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <Droplet className="w-16 h-16 text-red-200 fill-red-200 mb-4" />
      <h1 className="text-4xl font-bold text-gray-800 mb-2">404</h1>
      <p className="text-gray-500 mb-6">The page you're looking for doesn't exist.</p>
      <Link to="/" className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors">
        Back to Home
      </Link>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* APP ROOT                                                            */
/* ------------------------------------------------------------------ */
export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/find-donors" element={<FindDonors />} />
              <Route path="/become-donor" element={<BecomeDonor />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
          <ToastContainer position="top-right" autoClose={3000} />
        </div>
      </Router>
    </AuthProvider>
  );
}
