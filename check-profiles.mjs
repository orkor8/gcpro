import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://kffomnfccuzwkbwgudqw.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmZm9tbmZjY3V6d2tid2d1ZHF3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTM4NTEyMSwiZXhwIjoyMDkwOTYxMTIxfQ.y5mLShfSCiRMPGGOTBPK5E9GVpuEkk1nj0HIeTJl_Lw";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Check auth users
console.log("=== משתמשי Auth ===");
const { data: authUsers } = await supabase.auth.admin.listUsers();
const testUsers = authUsers.users.filter(u => u.email?.includes("clinhub.test"));
for (const u of testUsers) {
  console.log(`  ${u.email} → id: ${u.id}`);
}

// Check profiles
console.log("\n=== פרופילים בטבלה ===");
const { data: profiles, error } = await supabase.from("profiles").select("user_id, email, role, status, full_name");
if (error) {
  console.error("שגיאה:", error.message);
} else {
  for (const p of profiles) {
    console.log(`  ${p.email} | role: ${p.role} | status: ${p.status} | user_id: ${p.user_id}`);
  }
}

// Cross-check
console.log("\n=== בדיקת התאמה ===");
for (const u of testUsers) {
  const match = profiles?.find(p => p.user_id === u.id);
  if (match) {
    console.log(`✓ ${u.email} → פרופיל קיים (${match.role})`);
  } else {
    console.log(`✗ ${u.email} → אין פרופיל!`);
  }
}
