import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/authService";
import { getApiErrorMessage } from "../services/api";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { Spinner } from "../components/ui/Primitives";
import GoogleIcon from "../components/ui/GoogleIcon";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const oauthError = new URLSearchParams(location.search).get("error");

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form);
      navigate(user.onboarding_complete ? "/dashboard" : "/onboarding");
    } catch (err) {
      setError(getApiErrorMessage(err, "Invalid email or password."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-transparent px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="card w-full max-w-sm p-9"
      >
        <Link to="/" className="font-display text-lg font-semibold text-ink">InterviewIQ</Link>

        <h1 className="mt-6 font-display text-2xl font-semibold text-ink">Welcome back</h1>
        <p className="mt-1.5 text-sm text-ink-soft">Log in to continue practicing.</p>

        {oauthError && (
          <p className="well mt-4 px-3 py-2 text-xs text-red-500">
            Google sign-in failed. Please try again or use email/password.
          </p>
        )}

        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
          <Input label="Email" type="email" name="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Password" type="password" name="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" disabled={loading} className="mt-2 w-full">
            {loading ? <Spinner /> : "Log in"}
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs text-ink-faint">
          <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
        </div>

        <Button as="a" href={authService.googleLoginUrl()} variant="secondary" className="w-full inline-flex items-center justify-center gap-2.5">
          <GoogleIcon className="h-4 w-4 shrink-0" />
          <span>Continue with Google</span>
        </Button>

        <p className="mt-7 text-center text-sm text-ink-soft">
          New here? <Link to="/signup" className="font-medium text-ink hover:text-emerald">Create an account</Link>
        </p>
      </motion.div>
    </div>
  );
}
