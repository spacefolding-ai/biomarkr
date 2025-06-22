import "dotenv/config";

export default {
  expo: {
    name: "Biomarkr",
    slug: "biomarkr",
    version: "1.0.0",
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    },
    scheme: "biomarkr",
    android: {
      package: "com.anonymous.biomarkr",
    },
    is: {
      package: "com.anonymous.biomarkr",
    },
  },
};
