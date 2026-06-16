"use client";

import { useState } from "react";
import { WealthStoreProvider, useWealthStore } from "@/lib/use-wealth-store";
import { Dashboard } from "./screens/Dashboard";
import { Profile } from "./screens/Profile";
import { FlowWorkspace } from "./screens/FlowWorkspace";

type Screen = "dashboard" | "profile" | "flow";

function WealthFolioApp() {
  const { data } = useWealthStore();
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [activeFlowId, setActiveFlowId] = useState(data.flows[0]?.id ?? "");

  if (screen === "profile") return <Profile onBack={() => setScreen("dashboard")} />;

  if (screen === "flow") return <FlowWorkspace flowId={activeFlowId} onBack={() => setScreen("dashboard")} />;

  return (
    <Dashboard
      onProfile={() => setScreen("profile")}
      onOpenFlow={(id) => {
        setActiveFlowId(id);
        setScreen("flow");
      }}
    />
  );
}

export default function Home() {
  return (
    <WealthStoreProvider>
      <WealthFolioApp />
    </WealthStoreProvider>
  );
}
