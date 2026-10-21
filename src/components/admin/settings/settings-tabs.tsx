"use client";

import type { ComponentType } from "react";
import { CompanySettingsForm } from "@/components/admin/settings/company-settings-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// The sections of /admin/settings, one tab each (docs/configuracoes/rotas.md).
// The chosen tab stays in the component and starts at Empresa.
type SettingsSection = {
  value: string;
  label: string;
  Content: ComponentType;
};

const SETTINGS_SECTIONS: SettingsSection[] = [
  { value: "company", label: "Empresa", Content: CompanySettingsForm },
];

export function SettingsTabs() {
  const [firstSection] = SETTINGS_SECTIONS;
  return (
    <Tabs defaultValue={firstSection.value} className="gap-6">
      {/* On a narrow screen the tabs scroll instead of overflowing. */}
      <TabsList className="max-w-full justify-start overflow-x-auto">
        {SETTINGS_SECTIONS.map(({ value, label }) => (
          <TabsTrigger key={value} value={value}>
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
      {/* Kept mounted, so changing the tab keeps what was typed. The panel
          starts with fields, so Tab goes from the tab to the first one
          instead of stopping on the panel (WAI-ARIA tabs pattern). */}
      {SETTINGS_SECTIONS.map(({ value, Content }) => (
        <TabsContent key={value} value={value} keepMounted tabIndex={-1}>
          <Content />
        </TabsContent>
      ))}
    </Tabs>
  );
}
