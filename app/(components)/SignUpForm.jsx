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
    <div className="h-fit w-[350px] flex flex-col items-center justify-center glass shadow-premium p-8 rounded-3xl text-black animate-in fade-in zoom-in-95 duration-500">
      <div className="w-full text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">Create Account</h1>
        <p className="text-sm text-gray-500 mt-2 font-medium">Start your style journey today.</p>
      </div>

      <form onSubmit={handleEmailSignUp} className="flex flex-col gap-y-4 w-full">
        <div className="relative group">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            className="outline-none border border-gray-200 pl-10 pr-3 w-full rounded-xl py-3 bg-white/50 backdrop-blur-sm placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 transition-all duration-200"
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="relative group">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
          <input
            type="email"
            placeholder="Email"
            value={email}
            className="outline-none border border-gray-200 pl-10 pr-3 w-full rounded-xl py-3 bg-white/50 backdrop-blur-sm placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 transition-all duration-200"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="relative group">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
          <input
            type="password"
            placeholder="Password"
            value={password}
            className="outline-none border border-gray-200 pl-10 pr-3 w-full rounded-xl py-3 bg-white/50 backdrop-blur-sm placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 transition-all duration-200"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="relative group">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            className="outline-none border border-gray-200 pl-10 pr-3 w-full rounded-xl py-3 bg-white/50 backdrop-blur-sm placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 transition-all duration-200"
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <Button className="w-full btn-gradient text-white font-bold py-6 rounded-xl shadow-lg shadow-purple-500/20 mt-2" type='submit'>Create Account</Button>
      </form>

      <div className="relative my-8 w-full">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-200"></span>
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-wider">
          <span className="bg-white/50 backdrop-blur-xl px-4 text-gray-400 font-medium rounded-full">Or continue with</span>
        </div>
      </div>

      <div className="w-full">
        <Button onClick={handleGoogleSignUp} variant="outline" className="w-full bg-white hover:bg-gray-50 border-gray-200 text-gray-700 font-semibold py-6 rounded-xl transition-all duration-200 hover:shadow-md">
          <RiGoogleFill className="mr-2 h-5 w-5 text-[#DB4437]" />
          Sign up with Google
        </Button>
        {error && <p className="text-red-500 text-sm font-medium mt-4 text-center bg-red-50 py-2 rounded-lg">{error}</p>}
      </div>
      <p className="text-xs text-center text-gray-500 mt-8 font-medium">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-purple-600 hover:text-purple-700 font-bold hover:underline transition-all">
          Sign In
        </Link>
      </p>
    </div>
  );
}

