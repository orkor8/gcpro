"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function saveProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const edcRaw = formData.get("edc_systems") as string;
  const edcSystems = edcRaw ? edcRaw.split(",").map(s => s.trim()).filter(Boolean) : [];

  const skillsRaw = formData.get("skills") as string;
  const skills = skillsRaw ? skillsRaw.split(",").map(s => s.trim()).filter(Boolean) : [];

  await (supabase.from("profiles") as any).update({
    full_name: formData.get("full_name") as string,
    phone: formData.get("phone") as string || null,
    city: formData.get("city") as string || null,
    bio: formData.get("bio") as string || null,
    linkedin_url: formData.get("linkedin_url") as string || null,
    degree: formData.get("degree") as string || null,
    field_of_study: formData.get("field_of_study") as string || null,
    institution: formData.get("institution") as string || null,
    english_level: formData.get("english_level") as string || null,
    edc_systems: edcSystems,
    has_coordinator_experience: formData.get("has_coordinator_experience") === "on",
    is_open_to_work: formData.get("is_open_to_work") === "on",
    skills,
  }).eq("user_id", user.id);

  redirect("/?saved=1");
}
