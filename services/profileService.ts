import { supabase } from "../lib/supabase";

export async function createUserProfile(user: any) {
  return await supabase.from("profiles").insert({
    id: user.id,
    full_name: user.user_metadata.full_name,
    education_level: "B.Tech",
    field_of_study: "CSE",
    target_role: "Software Engineer"
  });
}

export async function updateSkill(skill: string, level: number) {
  return await supabase.from("user_skills").upsert({
    user_id: (await supabase.auth.getUser()).data.user.id,
    skill_name: skill,
    skill_level: level
  });
}

export async function getUserTwin() {
  const user = (await supabase.auth.getUser()).data.user;

  const profile = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const skills = await supabase.from("user_skills").select("*").eq("user_id", user.id);
  const interests = await supabase.from("user_interests").select("*").eq("user_id", user.id);
  const constraints = await supabase.from("user_constraints").select("*").eq("user_id", user.id).single();

  return {
    profile: profile.data,
    skills: skills.data,
    interests: interests.data,
    constraints: constraints.data
  };
}
