import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";
import TelephonyComponent from "@/components/telephony/Telephony";

export const metadata: Metadata = {
  title: "Next.js Telephony | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Telephony page for TailAdmin  Tailwind CSS Admin Dashboard Template",
  // other metadata
};
export default function page() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Telephony" />
      <TelephonyComponent />
    </div>
  );
}
