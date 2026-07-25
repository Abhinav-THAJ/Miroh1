"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProductIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/product/MI0036/");
  }, [router]);

  return (
    <div className="min-h-screen bg-primary-bg flex items-center justify-center text-warm-ivory font-light text-sm">
      Redirecting to featured product...
    </div>
  );
}
