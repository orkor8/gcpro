import { createClient } from "@/lib/supabase/server";
import { StudentSidebar } from "./StudentSidebar";
import { Footer } from "@/components/ui/Footer";

const roleLabels: Record<string, string> = {
  student_gcp: "בוגר GCP",
  student_cra: "בוגר CRA",
  lecturer_gcp: "מרצה GCP",
  lecturer_cra: "מרצה CRA",
  admin: "מנהל",
};

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile: { full_name: string; role: string; status: string } | null = null;
  console.log("LAYOUT - user:", user?.id ?? "NULL");
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("full_name, role, status")
      .eq("user_id", user.id)
      .maybeSingle() as unknown as { data: { full_name: string; role: string; status: string } | null };
    profile = data;
  }

  return (
    <>
      <StudentSidebar profile={profile} />
      <div className="lg:mr-[260px] pt-14 lg:pt-0 flex flex-col min-h-screen" dir="rtl" style={{ fontFamily: "var(--font-rubik), Rubik, sans-serif" }}>
        <div className="flex-1">{children}</div>
        <Footer />
      </div>
    </>
  );
}
