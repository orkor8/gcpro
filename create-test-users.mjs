import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://kffomnfccuzwkbwgudqw.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmZm9tbmZjY3V6d2tid2d1ZHF3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTM4NTEyMSwiZXhwIjoyMDkwOTYxMTIxfQ.y5mLShfSCiRMPGGOTBPK5E9GVpuEkk1nj0HIeTJl_Lw";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const TEST_PASSWORD = "Clinhub2026!";

const users = [
  { email: "student.gcp@clinhub.test", role: "student_gcp", full_name: "סטודנט GCP", status: "approved" },
  { email: "student.cra@clinhub.test", role: "student_cra", full_name: "סטודנט CRA", status: "approved" },
  { email: "employer@clinhub.test",    role: "employer",     full_name: "מעסיק לדוגמה", status: "approved" },
  { email: "admin@clinhub.test",       role: "admin",        full_name: "מנהל מערכת",   status: "approved" },
];

for (const u of users) {
  console.log(`יוצר: ${u.email}`);

  // Delete existing user if exists
  const { data: existing } = await supabase.auth.admin.listUsers();
  const found = existing?.users?.find((x) => x.email === u.email);
  if (found) {
    await supabase.auth.admin.deleteUser(found.id);
    console.log(`  מחק משתמש קיים`);
  }

  // Create auth user
  const { data: created, error } = await supabase.auth.admin.createUser({
    email: u.email,
    password: TEST_PASSWORD,
    email_confirm: true,
  });

  if (error || !created?.user) {
    console.error(`  שגיאה: ${error?.message}`);
    continue;
  }

  const userId = created.user.id;

  // Create profile
  const { error: profileError } = await supabase.from("profiles").upsert({
    user_id: userId,
    email: u.email,
    full_name: u.full_name,
    role: u.role,
    status: u.status,
  });

  if (profileError) {
    console.error(`  שגיאה בפרופיל: ${profileError.message}`);
  } else {
    console.log(`  נוצר בהצלחה ✓`);
  }
}

console.log("\nסיום!");
