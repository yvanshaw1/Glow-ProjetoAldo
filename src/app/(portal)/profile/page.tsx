import type { Metadata } from "next";
import { ProfileTabs } from "@/components/portal/clients/profile-tabs";

export const metadata: Metadata = { title: "Minha conta – Glow" };

// UC04 and UC05: the account data, the password and the vehicles of the
// client, in tabs (docs/clientes/area-do-cliente.md).
export default function ProfilePage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-14 lg:px-8">
      <h1 className="text-h3 font-bold md:text-h2">Minha conta</h1>
      <ProfileTabs />
    </div>
  );
}
