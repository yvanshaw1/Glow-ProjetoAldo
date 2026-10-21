import type { Metadata } from "next";
import { SettingsTabs } from "@/components/admin/settings/settings-tabs";
import { PERMISSION_LABELS } from "@/shared/constants/permissions";

export const metadata: Metadata = { title: "Configurações – Glow" };

// UC22, UC23 and UC24: the settings of the company, in tabs.
export default function SettingsPage() {
  return (
    <>
      <h1 className="text-h3 font-bold md:text-h2">
        {PERMISSION_LABELS.settings}
      </h1>
      <SettingsTabs />
    </>
  );
}
