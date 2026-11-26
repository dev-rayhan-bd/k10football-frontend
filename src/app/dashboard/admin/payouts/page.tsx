"use client";

import { Suspense } from "react";
import SuperAdminPayouts from "@/components/user-wise-dashboard/super-admin-dashboard/Payouts";

const PayoutsPage = () => {
  return (
    <Suspense fallback={null}>
      <SuperAdminPayouts />
    </Suspense>
  );
};

export default PayoutsPage;
