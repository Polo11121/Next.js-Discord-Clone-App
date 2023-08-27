import { ReactNode } from "react";

type AuthLayoutProps = {
  children: ReactNode;
};

const AuthLayout = ({ children }: AuthLayoutProps) => (
  <div className="flex justify-center items-center h-full">{children}</div>
);

export default AuthLayout;
