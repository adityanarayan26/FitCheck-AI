"use client";
import { useState } from "react";
import { RiGoogleFill } from "@remixicon/react";
import { signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebaseConfig";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock } from "lucide-react";

export default function LogInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
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
    <div className="h-fit w-[350px] flex flex-col items-center justify-center bg-white/20 backdrop-blur-md p-8 rounded-2xl shadow-xl text-black">
      <div className="w-full text-center mb-6">
        <h1 className="text-3xl font-semibold">Welcome Back</h1>
        <p className="text-sm text-gray-800">Sign in to continue to your dashboard.</p>
      </div>

      <form onSubmit={handleEmailLogin} className="flex flex-col gap-y-4 w-full">
        <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-800" />
            <input
            type="email"
            placeholder="Email"
            value={email}
            className="outline-none border-[1px] pl-10 pr-3 border-white/20 w-full rounded-lg py-2 bg-transparent placeholder:text-gray-800"
            onChange={(e) => setEmail(e.target.value)}
            required
            />
        </div>
        <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-800" />
            <input
            type="password"
            placeholder="Password"
            value={password}
            className="outline-none border-[1px] pl-10 pr-3 border-white/20 w-full rounded-lg py-2 bg-transparent placeholder:text-gray-800"
            onChange={(e) => setPassword(e.target.value)}
            required
            />
        </div>
        <Button variant="outline" className='w-full cursor-pointer bg-white/10 hover:bg-white/20 text-black font-semibold' type='submit'>
            Sign In
        </Button>
      </form>

      <div className="relative my-6 w-full">
        <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/20"></span>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white/10 px-2 text-gray-800 rounded-full">Or continue with</span>
        </div>
      </div>

      <div className="w-full">
        <Button onClick={handleGoogleLogin} className="bg-[#DB4437] text-white hover:bg-[#DB4437]/90 w-full font-semibold">
            <RiGoogleFill className="mr-2 h-5 w-5" />
            Login with Google
        </Button>
        {error && <p className="text-red-400 text-xs mt-3 text-center">{error}</p>}
      </div>

      <p className="text-xs text-center text-gray-800 mt-6">
        Don't have an account?{" "}
        <Link href="/sign-up" className="underline hover:text-black font-semibold">
          Sign up
        </Link>
      </p>
    </div>
  );
}

