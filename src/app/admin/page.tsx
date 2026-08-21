import { redirect } from "next/navigation";

// /admin → /admin/dashboard
export default function AdminRoot() {
  redirect("/admin/dashboard");
}
