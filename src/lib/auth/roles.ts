// Default landing route per role. Mirrors ROLE_DEFAULT_PATHS in src/proxy.ts
// (proxy keeps its own copy because it runs in the edge middleware bundle).
export const ROLE_DEFAULT_PATHS: Record<string, string> = {
  SUPER_ADMIN: "/admin/dashboard",
  ADMIN: "/admin/dashboard",
  EDITOR: "/admin/dashboard",
  WORKER: "/worker/dashboard",
  SUPPORT: "/support/dashboard",
  CUSTOMER: "/home",
};

export function defaultPathForRole(role: string): string {
  return ROLE_DEFAULT_PATHS[role] ?? "/home";
}
