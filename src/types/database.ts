export type UserRole =
  | "student_gcp"
  | "student_cra"
  | "employer"
  | "lecturer_gcp"
  | "lecturer_cra"
  | "admin";

export type ProfileStatus = "pending" | "approved";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          role: UserRole;
          status: ProfileStatus;
          full_name: string;
          email: string;
          phone: string | null;
          bio: string | null;
          photo_url: string | null;
          cv_url: string | null;
          linkedin_url: string | null;
          city: string | null;
          skills: string[] | null;
          degree: string | null;
          field_of_study: string | null;
          institution: string | null;
          english_level: string | null;
          edc_systems: string[] | null;
          has_coordinator_experience: boolean;
          is_open_to_work: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      certificates: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          file_url: string;
          issue_date: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["certificates"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["certificates"]["Insert"]>;
      };
      jobs: {
        Row: {
          id: string;
          employer_id: string;
          title: string;
          company: string;
          location: string;
          job_type: string;
          description: string;
          requirements: string | null;
          published_at: string | null;
          early_access_until: string;
          is_active: boolean;
          created_at: string;
          status: "pending" | "approved" | "rejected";
          rejection_reason: string | null;
          target_audience: string[] | null;
          is_junior_friendly: boolean;
          travel_percent: number | null;
          therapeutic_area: string | null;
          trial_phase: string | null;
          experience_level: string | null;
          salary_range: string | null;
          start_date: string | null;
          application_method: string;
          is_discrete: boolean;
        };
        Insert: Omit<Database["public"]["Tables"]["jobs"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["jobs"]["Insert"]>;
      };
      questions: {
        Row: {
          id: string;
          student_id: string;
          lecturer_id: string;
          subject: string;
          body: string;
          student_email: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["questions"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["questions"]["Insert"]>;
      };
      lecturers: {
        Row: {
          id: string;
          name: string;
          email: string;
          specialty: string;
          course_type: "gcp" | "cra" | "both";
          bio: string | null;
          photo_url: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["lecturers"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["lecturers"]["Insert"]>;
      };
      knowledge_items: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          content_url: string | null;
          content_type: "video" | "document" | "live" | "article";
          cra_only: boolean;
          published_at: string;
          thumbnail_url: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["knowledge_items"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["knowledge_items"]["Insert"]>;
      };
    };
  };
};
