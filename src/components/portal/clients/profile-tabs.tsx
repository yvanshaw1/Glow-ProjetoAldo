"use client";

import type { ComponentType } from "react";
import { AccountSection } from "@/components/portal/clients/account-form";
import { PasswordSection } from "@/components/portal/clients/password-section";
import { VehicleList } from "@/components/portal/vehicles/vehicle-list";
import { DemoNotice } from "@/components/shared/demo-notice";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// The tabs of /profile (docs/clientes/area-do-cliente.md). The chosen tab
// stays in the component and starts at Dados pessoais.
type ProfileTab = {
  value: string;
  label: string;
  Content: ComponentType;
};

function PersonalDataPanel() {
  return (
    <div className="flex flex-col gap-8">
      <AccountSection />
      <PasswordSection />
    </div>
  );
}

// The whole tab has demo data: the notice is at the top of the panel.
function VehiclesPanel() {
  return (
    <div className="flex flex-col gap-8">
      <DemoNotice />
      <VehicleList />
    </div>
  );
}

const PROFILE_TABS: ProfileTab[] = [
  { value: "personal", label: "Dados pessoais", Content: PersonalDataPanel },
  { value: "vehicles", label: "Meus veículos", Content: VehiclesPanel },
];

export function ProfileTabs() {
  const [firstTab] = PROFILE_TABS;
  return (
    <Tabs defaultValue={firstTab.value} className="gap-6">
      <TabsList className="w-full">
        {PROFILE_TABS.map(({ value, label }) => (
          <TabsTrigger key={value} value={value}>
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
      {/* Kept mounted, so changing the tab keeps what was typed. Each panel
          has its own buttons near the top, so it takes no focus stop of its
          own. */}
      {PROFILE_TABS.map(({ value, Content }) => (
        <TabsContent key={value} value={value} keepMounted tabIndex={-1}>
          <Content />
        </TabsContent>
      ))}
    </Tabs>
  );
}
