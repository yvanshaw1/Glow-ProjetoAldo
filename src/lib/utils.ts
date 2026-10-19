import { createCn } from "cn/config";

// cn() of shadcn/ui: joins class names and drops the conflicting Tailwind
// ones. The heading sizes of the theme (globals.css) are font sizes; without
// them here, cn() takes text-h3 for a color and drops it next to
// text-foreground.
export const cn = createCn({
  extend: {
    classGroups: { "font-size": [{ text: ["h1", "h2", "h3", "display"] }] },
  },
});
