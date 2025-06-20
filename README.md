# Biomarkr SaaS - React Native Expo App

This repository contains the official React Native Expo client app for Biomarkr — a SaaS platform for medical lab reports extraction, blood marker tracking, and AI-powered analysis.

---

## 🛠 Tech Stack

- **Expo SDK (Managed Workflow)**
- **React Native**
- **Supabase (Auth, Database, Storage)**
- **n8n (Backend Extraction Pipelines)**
- **OpenAI GPT-4o (Vision & Extraction Agent)**
- **React Hook Form + Zod (Form Validation)**
- **react-native-toast-message (Toast Notifications)**
- **expo-notifications (Push Notifications)**

---

## 🔐 Authentication

- Powered by Supabase Auth
- Email/password only (social login not yet enabled)
- Secure `auth_user_id` binding to database users table
- RLS-ready architecture (Row Level Security)

---

## ⚙ Environment Variables

Stored inside `.env` files (loaded automatically by Expo)

```env
EXPO_PUBLIC_SUPABASE_URL=https://<your-supabase-project>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

Never commit service role keys into the app.

---

## 🚀 Development Commands

### Install dependencies

```bash
npm install
```

### Start Expo (local dev)

```bash
npx expo start
```

### Clear Metro cache (recommended after env changes)

```bash
npx expo start --clear
```

### Load environment config

```bash
npx expo start --config-env development
```

---

## ✅ Current Features

- User signup & login (with email normalization)
- Secure full-name insertion after signup
- SaaS-safe DB trigger architecture (auth.users → users)
- Expo Notifications installed
- Toast messaging installed
- SaaS-grade environment separation with `.env` support

---

## 🔬 Next SaaS Modules (in progress)

- File Upload to Supabase Storage
- n8n Webhook Automation
- Extraction Flow Wiring (OpenAI Vision)
- Blood Marker Insertion into Database
- Admin Dashboard (future SaaS version)

---

## 👩‍💻 SaaS Architecture Summary

- **Supabase Auth** — full user management
- **Supabase DB** — relational core for reports, markers, and user data
- **Supabase Storage** — file upload and storage layer
- **n8n** — extraction engine, webhooks, AI pipelines
- **OpenAI GPT-4o Vision** — blood report extraction

---

## ⚠ Security Note

- Do not expose `service_role` keys to frontend.
- All private keys must remain on secure backend (n8n).

---

## 📦 Deployment

- Fully Expo Managed Workflow compatible
- iOS Simulator & Android Emulator supported

---

## 🧲 Testing Notes

- Always clear Expo Go cache when switching between web & native
- Normalize all emails with `toLowerCase()` before passing to Supabase Auth

---

## 🔗 References

- [Supabase Docs](https://supabase.com/docs)
- [Expo Docs](https://docs.expo.dev/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Docs](https://zod.dev/)
- [react-native-toast-message](https://github.com/calintamas/react-native-toast-message)
- [expo-notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)

---

> SaaS-grade architecture is designed for future scale, HIPAA/GDPR compliance, and production readiness.

---

## 🚀 SaaS Founder:

You are executing SaaS the correct way.\
💥 Biomarkr AI Pipeline coming next.

## Lab Report Extraction Status

| Status      | When it Happens                                   | UI Label Example          |
| ----------- | ------------------------------------------------- | ------------------------- |
| pending     | After file upload, before any processing starts   | "Waiting to start…"       |
| processing  | During OCR/parsing/analysis (combined step)       | "Analyzing your report…"  |
| saving      | After analysis, while saving biomarkers to DB     | "Saving results…"         |
| done        | Everything succeeded and data is stored           | "Completed ✅"            |
| error       | Something failed during any step                  | "Something went wrong ❌" |
| unsupported | File type/structure is not recognized or unusable | "Unsupported format ⚠️"   |
