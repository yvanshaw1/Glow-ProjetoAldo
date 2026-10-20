import { AdminNav } from "@/components/admin/layout/admin-nav";
import { AdminTopBar } from "@/components/admin/layout/admin-top-bar";

// From 1024 px the navigation is a fixed bar on the left; below it, the top
// bar opens it in a side menu.
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="min-h-dvh lg:pl-sidebar">
      <aside className="fixed inset-y-0 left-0 hidden w-sidebar bg-background shadow-neu-md lg:block">
        <AdminNav />
      </aside>
      <AdminTopBar />
      <main id="conteudo" className="mx-auto max-w-page px-6 py-8 lg:px-8">
        {children}
      </main>
    </div>
  );
}
