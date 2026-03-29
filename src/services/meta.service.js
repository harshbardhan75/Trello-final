import { supabase } from "../config/supabaseClient.js";

export const getAllLabels = async () => {
  const { data, error } = await supabase
    .from("labels")
    .select("*")
    .order("id", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
};

export const getAllMembers = async () => {
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .order("id", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
};
