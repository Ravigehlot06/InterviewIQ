import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/authService";
import { Spinner } from "../components/ui/Primitives";

/**
 * Lands here after Google redirects back with ?access_token=&refresh_token=
 * (see backend app/routes/auth_routes.py google_callback).
 */
export default function AuthCallback() {
  const [params] = useSearchParams();
  const { loginWithTokens } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");

    if (!accessToken) {
      navigate("/login?error=google_auth_failed");
      return;
    }

    localStorage.setItem("iq_access_token", accessToken);
    authService
      .me()
      .then((user) => {
        loginWithTokens(accessToken, refreshToken, user);
        navigate(user.onboarding_complete ? "/dashboard" : "/onboarding");
      })
      .catch(() => navigate("/login?error=google_auth_failed"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-transparent">
      <div className="flex flex-col items-center gap-3 text-ink-soft">
        <Spinner className="h-6 w-6" />
        <span className="text-sm">Signing you in...</span>
      </div>
    </div>
  );
}
