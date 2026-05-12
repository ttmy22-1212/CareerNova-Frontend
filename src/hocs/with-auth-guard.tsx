import AuthGuard from "@/guards/auth-guard";
import type { FC } from "react";

export const withAuthGuard =
  <P extends object>(Component: FC<P>): FC<P> =>
  (props: P) =>
    (
      <AuthGuard>
        <Component {...props} />
      </AuthGuard>
    );
