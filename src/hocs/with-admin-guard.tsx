import AdminGuard from "@/guards/admin-guard";
import type { FC } from "react";

export const withAdminGuard =
  <P extends object>(Component: FC<P>): FC<P> =>
  (props: P) =>
    (
      <AdminGuard>
        <Component {...props} />
      </AdminGuard>
    );
