"use client";

import { useRouter } from "next/navigation";
import { AccessGate } from "@/components/AccessGate";

export default function AccessPage() {
  const router = useRouter();
  return <AccessGate onSuccess={() => router.push("/feature-1")} />;
}
