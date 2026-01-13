"use client";
import { useState } from "react";
import { RiGoogleFill } from "@remixicon/react";
import { signInWithPopup, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebaseConfig";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User } from "lucide-react";

export default function SignUpForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSignUp = async () => {
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/dashboard");
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message);
      }
    }
  };

  return (
    <div className="w-full bg-white border border-zinc-200 shadow-sm p-8 rounded-2xl">
      <div className="w-full text-center mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Create Account</h1>
        <p className="text-sm text-zinc-500 mt-2">Start your style journey with FitCheck AI</p>
      </div>

      <form onSubmit={handleEmailSignUp} className="flex flex-col gap-y-4 w-full">
        <div className="relative group">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-zinc-600 transition-colors" />
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            className="outline-none border border-zinc-200 pl-10 pr-3 w-full rounded-lg py-2.5 bg-white text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 transition-all text-sm"
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="relative group">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-zinc-600 transition-colors" />
          <input
            type="email"
            placeholder="Email"
            value={email}
            className="outline-none border border-zinc-200 pl-10 pr-3 w-full rounded-lg py-2.5 bg-white text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 transition-all text-sm"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="relative group">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-zinc-600 transition-colors" />
          <input
            type="password"
            placeholder="Password"
            value={password}
            className="outline-none border border-zinc-200 pl-10 pr-3 w-full rounded-lg py-2.5 bg-white text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 transition-all text-sm"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="relative group">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-zinc-600 transition-colors" />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            className="outline-none border border-zinc-200 pl-10 pr-3 w-full rounded-lg py-2.5 bg-white text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 transition-all text-sm"
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <Button
          className="w-full bg-brand-lime text-black hover:bg-brand-lime/90 font-semibold py-5 rounded-lg transition-all mt-2"
          type='submit'
        >
          Create Account
        </Button>
      </form>

      <div className="relative my-6 w-full">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-zinc-100"></span>
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-wider">
          <span className="bg-white px-2 text-zinc-400">Or continue with</span>
        </div>
      </div>

      <div className="w-full space-y-4">
        <Button onClick={handleGoogleSignUp} variant="outline" className="w-full bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-700 py-5 rounded-lg transition-all">
          <RiGoogleFill className="mr-2 h-5 w-5" />
          Sign up with Google
        </Button>
        {error && <p className="text-red-500 text-sm bg-red-50 border border-red-100 p-2 rounded-lg text-center">{error}</p>}
      </div>
      <p className="text-sm text-center text-zinc-500 mt-8">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-zinc-900 hover:text-black font-semibold hover:underline transition-all">
          Sign In
        </Link>
      </p>
    </div>
  );
}
