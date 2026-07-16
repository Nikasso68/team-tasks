"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/components/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const { session, loading } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && session) {
      router.replace("/");
    }
  }, [loading, session, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setSubmitting(true);

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(traduireErreur(error.message));
      else router.replace("/");
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) {
        setError(traduireErreur(error.message));
      } else {
        setInfo("Compte créé. Si la confirmation par e-mail est activée, vérifie ta boîte mail avant de te connecter.");
        setMode("login");
      }
    }
    setSubmitting(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold mb-1 text-center">Team Tasks</h1>
        <p className="text-sm text-gray-500 mb-6 text-center">
          {mode === "login" ? "Connecte-toi à l'espace de ton équipe" : "Crée ton compte"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-3 bg-white border border-line rounded-lg p-6 shadow-sm">
          {mode === "signup" && (
            <div>
              <label className="text-sm text-gray-600 block mb-1">Nom complet</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          )}
          <div>
            <label className="text-sm text-gray-600 block mb-1">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">Mot de passe</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {info && <p className="text-sm text-green-600">{info}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-accent text-white rounded-md py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? "..." : mode === "login" ? "Se connecter" : "Créer le compte"}
          </button>
        </form>

        <p className="text-sm text-center text-gray-500 mt-4">
          {mode === "login" ? (
            <>
              Pas encore de compte ?{" "}
              <button className="text-accent underline" onClick={() => setMode("signup")}>
                Créer un compte
              </button>
            </>
          ) : (
            <>
              Déjà un compte ?{" "}
              <button className="text-accent underline" onClick={() => setMode("login")}>
                Se connecter
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

function traduireErreur(message: string): string {
  if (message.includes("Invalid login credentials")) return "E-mail ou mot de passe incorrect.";
  if (message.includes("User already registered")) return "Un compte existe déjà avec cet e-mail.";
  if (message.includes("Password should be")) return "Le mot de passe doit faire au moins 6 caractères.";
  return message;
}
