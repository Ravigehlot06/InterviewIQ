import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { profileService } from "../services";
import Button from "../components/ui/Button";
import { Badge } from "../components/ui/Primitives";

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const onLogout = async () => {
    await logout();
    navigate("/login");
  };

  const onDeleteConfirmed = async () => {
    try {
      await profileService.deleteAccount();
    } finally {
      await logout();
      navigate("/login");
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-[24px] font-semibold text-ink">Settings</h1>

      <section className="card mt-7 p-6">
        <h2 className="text-sm font-semibold text-ink">Account</h2>
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-ink-soft">Signed in as</span>
          <span className="text-ink">{user?.email}</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-ink-soft">Connected Google account</span>
          <Badge tone={user?.auth_provider === "google" ? "live" : "neutral"}>
            {user?.auth_provider === "google" ? "Connected" : "Not connected"}
          </Badge>
        </div>
      </section>

      <section className="card mt-5 p-6">
        <h2 className="text-sm font-semibold text-ink">Security</h2>
        <p className="mt-2 text-sm text-ink-soft">
          Password changes are managed via email/password login. Google-authenticated accounts don't need a password.
        </p>
      </section>

      <section className="card mt-5 p-6">
        <h2 className="text-sm font-semibold text-ink">Session</h2>
        <Button variant="secondary" onClick={onLogout} className="mt-4">Log out</Button>
      </section>

      <section className="card mt-5 p-6">
        <h2 className="text-sm font-semibold text-red-500">Delete account</h2>
        <p className="mt-2 text-sm text-ink-soft">
          Permanently deletes your account, resumes, and interview history. This cannot be undone.
        </p>
        {!confirmingDelete ? (
          <Button variant="danger" onClick={() => setConfirmingDelete(true)} className="mt-4">Delete account</Button>
        ) : (
          <div className="mt-4 flex items-center gap-3">
            <Button variant="danger" onClick={onDeleteConfirmed}>Yes, delete permanently</Button>
            <Button variant="ghost" onClick={() => setConfirmingDelete(false)}>Cancel</Button>
          </div>
        )}
      </section>
    </div>
  );
}
