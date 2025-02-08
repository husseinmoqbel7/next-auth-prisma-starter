"use client";

import { useCurrentRole } from "@/hooks/use-current-role";
import FormError from "../form-error";

interface RoleGateProps {
  allowedRole: string;
  children: React.ReactNode;
}

const RoleGate = ({ allowedRole, children }: RoleGateProps) => {
  const role = useCurrentRole();

  if (role !== allowedRole)
    return (
      <FormError message="You don't have permission to view this content" />
    );
  return <>{children}</>;
};

export default RoleGate;
