import { redirect } from "next/navigation";

// /admin has no direct page — redirect to the primary admin section
export default function AdminPage() {
    redirect("/admin/email-templates");
}
