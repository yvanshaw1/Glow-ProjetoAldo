"use client";

import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { CategoryFormDialog } from "@/components/admin/catalog/category-form-dialog";
import { CategoryList } from "@/components/admin/catalog/category-list";
import { ServiceList } from "@/components/admin/catalog/service-list";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// RF057 (docs/catalogo/servicos-do-painel.md): the catalog of services and the
// categories, one tab each, with the button that creates the item of the tab
// beside them.

const SECTIONS = [
  { value: "services", label: "Serviços" },
  { value: "categories", label: "Categorias" },
] as const;

type Section = (typeof SECTIONS)[number]["value"];

export function CatalogTabs() {
  const [section, setSection] = useState<Section>("services");
  // A new category makes the list be read again.
  const [categoryReadCount, setCategoryReadCount] = useState(0);
  return (
    <Tabs
      value={section}
      onValueChange={(value) => setSection(value as Section)}
      className="gap-6"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <TabsList className="w-full md:w-fit">
          {SECTIONS.map(({ value, label }) => (
            <TabsTrigger key={value} value={value}>
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
        {section === "categories" && (
          <CategoryFormDialog
            onSaved={() => setCategoryReadCount((count) => count + 1)}
            trigger={
              <Button className="w-full md:w-auto">
                <PlusIcon aria-hidden />
                Nova categoria
              </Button>
            }
          />
        )}
      </div>
      {/* Each tab mounts its list when chosen, so it reads the route again and
          starts with no search or filter. The cards have their own buttons,
          so the panel takes no focus stop of its own. */}
      <TabsContent value="services" tabIndex={-1}>
        <ServiceList />
      </TabsContent>
      <TabsContent value="categories" tabIndex={-1}>
        <CategoryList key={categoryReadCount} />
      </TabsContent>
    </Tabs>
  );
}
