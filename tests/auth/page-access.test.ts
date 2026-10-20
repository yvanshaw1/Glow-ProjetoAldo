import { describe, expect, it } from "vitest";
import { decidePageAccess, type PageAccount } from "@/server/auth/page-access";
import { PERMISSION_PAGES, PERMISSIONS } from "@/shared/constants/permissions";

// Where src/proxy.ts sends each person (docs/acesso/protecao-das-paginas.md,
// decisions 0051 and 0052): the requested address and the account go in, the
// redirect comes out, or null to show the page.

const CLIENT: PageAccount = {
  profile: "client",
  isActive: true,
  mustChangePassword: false,
  permissions: [],
};
const PENDING_CLIENT: PageAccount = { ...CLIENT, mustChangePassword: true };
const STAFF: PageAccount = {
  profile: "staff",
  isActive: true,
  mustChangePassword: false,
  permissions: ["appointments", "clients"],
};
const PENDING_STAFF: PageAccount = { ...STAFF, mustChangePassword: true };
// An inactive role grants no permission (docs/equipe/dados.md).
const STAFF_WITHOUT_PERMISSION: PageAccount = { ...STAFF, permissions: [] };
const DEACTIVATED_STAFF: PageAccount = { ...STAFF, isActive: false };
const ADMIN: PageAccount = {
  profile: "admin",
  isActive: true,
  mustChangePassword: false,
  permissions: [...PERMISSIONS],
};

describe("decidePageAccess", () => {
  describe("visitor", () => {
    it("sends a visitor on a client page to the login with the page in next (RF010, RN001)", () => {
      expect(decidePageAccess("/booking", null)).toBe("/login?next=%2Fbooking");
    });

    it("keeps the query of the requested page in next", () => {
      expect(decidePageAccess("/appointments?page=2", null)).toBe(
        "/login?next=%2Fappointments%3Fpage%3D2",
      );
    });

    it("sends a visitor on a panel page to the login with the page in next (RS001)", () => {
      expect(decidePageAccess("/admin/settings", null)).toBe(
        "/login?next=%2Fadmin%2Fsettings",
      );
    });

    it("shows the login and the sign-up to a visitor", () => {
      expect(decidePageAccess("/login", null)).toBeNull();
      expect(decidePageAccess("/register", null)).toBeNull();
    });

    it("sends a visitor on the password change to the login", () => {
      expect(decidePageAccess("/set-password", null)).toBe("/login");
    });

    it("treats a deactivated account as a visitor (RN026)", () => {
      expect(decidePageAccess("/admin", DEACTIVATED_STAFF)).toBe(
        "/login?next=%2Fadmin",
      );
      expect(decidePageAccess("/login", DEACTIVATED_STAFF)).toBeNull();
    });
  });

  describe("client", () => {
    it("brings a client back to the page in next after the login (RF010)", () => {
      expect(decidePageAccess("/login?next=%2Fbooking", CLIENT)).toBe(
        "/booking",
      );
    });

    it("sends a client on the login or the sign-up to the portal home", () => {
      expect(decidePageAccess("/login", CLIENT)).toBe("/");
      expect(decidePageAccess("/register", CLIENT)).toBe("/");
    });

    it("sends a client on a panel page to the portal home with the notice (RS010)", () => {
      expect(decidePageAccess("/admin", CLIENT)).toBe("/?denied=1");
      expect(decidePageAccess("/admin/settings", CLIENT)).toBe("/?denied=1");
    });

    it("lets a client open the client pages", () => {
      expect(decidePageAccess("/booking", CLIENT)).toBeNull();
      expect(decidePageAccess("/profile", CLIENT)).toBeNull();
      expect(decidePageAccess("/appointments", CLIENT)).toBeNull();
    });
  });

  describe("staff and admin", () => {
    it("sends staff without the page permission to the first allowed page with the notice (RN025)", () => {
      expect(decidePageAccess("/admin/settings", STAFF)).toBe(
        "/admin/appointments?denied=1",
      );
      expect(decidePageAccess("/admin", STAFF)).toBe(
        "/admin/appointments?denied=1",
      );
    });

    it("lets staff open a page their role allows", () => {
      expect(decidePageAccess("/admin/clients", STAFF)).toBeNull();
    });

    it("sends staff on the login to the first allowed page", () => {
      expect(decidePageAccess("/login", STAFF)).toBe("/admin/appointments");
      expect(decidePageAccess("/login", ADMIN)).toBe("/admin");
    });

    it("lets the admin open every panel page (RN027)", () => {
      for (const page of Object.values(PERMISSION_PAGES)) {
        expect(decidePageAccess(page, ADMIN)).toBeNull();
      }
    });

    it("sends staff on a client page to the first allowed page with the notice", () => {
      expect(decidePageAccess("/booking", STAFF)).toBe(
        "/admin/appointments?denied=1",
      );
    });

    it("sends staff without any permission to the portal home with the notice", () => {
      expect(decidePageAccess("/admin", STAFF_WITHOUT_PERMISSION)).toBe(
        "/?denied=1",
      );
      expect(decidePageAccess("/login", STAFF_WITHOUT_PERMISSION)).toBe(
        "/?denied=1",
      );
    });

    it("lets staff reach an unknown panel address", () => {
      expect(decidePageAccess("/admin/unknown", STAFF)).toBeNull();
    });
  });

  describe("pending password change", () => {
    it("sends a pending account on a restricted page to the password change with the page in next (RN023, RS004)", () => {
      expect(decidePageAccess("/booking", PENDING_CLIENT)).toBe(
        "/set-password?next=%2Fbooking",
      );
      expect(decidePageAccess("/admin", PENDING_STAFF)).toBe(
        "/set-password?next=%2Fadmin",
      );
    });

    it("sends a pending account on the login or the sign-up to the password change, keeping next", () => {
      expect(decidePageAccess("/login?next=%2Fbooking", PENDING_CLIENT)).toBe(
        "/set-password?next=%2Fbooking",
      );
      expect(decidePageAccess("/register", PENDING_CLIENT)).toBe(
        "/set-password",
      );
    });

    it("shows the password change to a pending account", () => {
      expect(decidePageAccess("/set-password", PENDING_CLIENT)).toBeNull();
    });

    it("sends an account without a pending change away from the password change, through next", () => {
      expect(decidePageAccess("/set-password?next=%2Fbooking", CLIENT)).toBe(
        "/booking",
      );
      expect(decidePageAccess("/set-password", STAFF)).toBe(
        "/admin/appointments",
      );
    });
  });

  describe("next", () => {
    it.each([
      "//evil.example",
      "/\\evil.example",
      "https://evil.example/booking",
      "booking",
      "/api/auth/logout",
      "/login",
      "/set-password",
    ])("ignores a next outside the pages of the site: %s", (next) => {
      const address = `/login?next=${encodeURIComponent(next)}`;
      expect(decidePageAccess(address, CLIENT)).toBe("/");
    });

    it("sends to the area home with the notice when next is not allowed for the profile", () => {
      expect(decidePageAccess("/login?next=%2Fadmin", CLIENT)).toBe(
        "/?denied=1",
      );
      expect(decidePageAccess("/login?next=%2Fadmin%2Fsettings", STAFF)).toBe(
        "/admin/appointments?denied=1",
      );
    });

    it("accepts a public page in next for any profile", () => {
      expect(decidePageAccess("/login?next=%2Fservices", STAFF)).toBe(
        "/services",
      );
    });
  });
});
