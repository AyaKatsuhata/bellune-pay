"use client";

import { Suspense } from "react";
import SuccessPageInner from "./success-page-inner";

export default function SuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessPageInner />
    </Suspense>
  );
}
