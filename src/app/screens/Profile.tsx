"use client";

import { FormEvent, useState } from "react";
import { useWealthStore } from "@/lib/use-wealth-store";

export function Profile({ onBack }: { onBack: () => void }) {
  const { data, updateProfile } = useWealthStore();
  const [profile, setProfile] = useState(data.profile);

  function submit(e: FormEvent) {
    e.preventDefault();
    updateProfile(profile);
    onBack();
  }

  return (
    <main className="app-shell">
      <button className="back-button" onClick={onBack}>
        ← Back to dashboard
      </button>
      <form className="profile-panel" onSubmit={submit}>
        <div>
          <p className="eyebrow">Profile</p>
          <h1>Household settings</h1>
        </div>
        <div className="form-grid">
          <label>
            Display name
            <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
          </label>
          <label>
            Base currency
            <input value={profile.baseCurrency} onChange={(e) => setProfile({ ...profile, baseCurrency: e.target.value.toUpperCase() })} />
          </label>
          <label>
            Monthly savings target
            <input type="number" min="0" value={profile.targetMonthlySavings} onChange={(e) => setProfile({ ...profile, targetMonthlySavings: Number(e.target.value) })} />
          </label>
          <label>
            Risk style
            <select value={profile.riskStyle} onChange={(e) => setProfile({ ...profile, riskStyle: e.target.value as typeof profile.riskStyle })}>
              <option>Conservative</option>
              <option>Balanced</option>
              <option>Growth</option>
            </select>
          </label>
        </div>
        <button className="primary-button">Save profile</button>
      </form>
    </main>
  );
}
