"use client";

interface LogoutButtonProps {
  children?: React.ReactNode;
}

import { logOut } from "@/actions/logout";
import React from "react";

const LogoutButton = ({ children }: LogoutButtonProps) => {
  const onClick = () => {
    logOut();
  };

  return (
    <span onClick={onClick} className="cursor-pointer">
      {children}
    </span>
  );
};

export default LogoutButton;
