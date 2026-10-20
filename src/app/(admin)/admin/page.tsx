import { PERMISSION_LABELS } from "@/shared/constants/permissions";

// Provisional: the dashboard content comes with UC09.
export default function DashboardPage() {
  return (
    <h1 className="text-h3 font-bold md:text-h2">
      {PERMISSION_LABELS.dashboard}
    </h1>
  );
}
