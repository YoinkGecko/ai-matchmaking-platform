import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function ProfileLinkBanner({ label }) {
  const { profileId, saveProfileId } = useAuth();
  const [value, setValue] = useState(profileId || "");
  const [saved, setSaved] = useState(false);

  if (profileId) return null;

  const handleSave = (e) => {
    e.preventDefault();
    if (!value.trim()) return;
    saveProfileId(value.trim());
    setSaved(true);
  };

  return (
    <div className="alert alert--info stack">
      <p>
        Link your <strong>{label}</strong> profile to use the dashboard. After registration on
        this device, your ID is saved automatically—or paste your profile UUID below.
      </p>
      {saved ? (
        <p>Profile linked. Reload if data does not appear.</p>
      ) : (
        <form className="btn-row" onSubmit={handleSave}>
          <input
            type="text"
            className="profile-link-input"
            placeholder={`${label} profile ID (UUID)`}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            aria-label={`${label} profile ID`}
          />
          <button type="submit" className="btn btn--primary">Save</button>
        </form>
      )}
    </div>
  );
}
