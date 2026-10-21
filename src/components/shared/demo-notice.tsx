import { FlaskConicalIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// docs/padroes/componentes.md, Telas de demonstração (decision 0055): right
// below the title of a screen, or at the top of a tab or section, whose data
// are not real yet, with no close button. A note, not an alert: it is on the
// page since the load, and the screen reader reads it in the page order.
export function DemoNotice() {
  return (
    <Alert role="note">
      <FlaskConicalIcon aria-hidden />
      <AlertDescription>
        <span className="font-semibold text-foreground">
          Dados de demonstração:
        </span>{" "}
        esta parte ainda não está ligada ao sistema, e nada do que você fizer
        nela é gravado.
      </AlertDescription>
    </Alert>
  );
}
