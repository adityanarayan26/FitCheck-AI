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
    <div className="h-fit w-[350px] flex flex-col items-center justify-center bg-white/20 backdrop-blur-md p-8 rounded-2xl shadow-xl text-black">
        <div className="w-full text-center mb-6">
            <h1 className="text-3xl font-semibold">Create an Account</h1>
            <p className="text-sm text-gray-800">Start your style journey today.</p>
        </div>

      <form onSubmit={handleEmailSignUp} className="flex flex-col gap-y-4 w-full">
         <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-black" />
            <input
            type="text"
            placeholder="Full Name"
            value={name}
            className="outline-none border-[1px] pl-10 pr-3 border-white/20 w-full rounded-lg py-2 bg-transparent placeholder:text-gray-500"
            onChange={(e) => setName(e.target.value)}
            required
            />
        </div>
        <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-black" />
            <input
            type="email"
            placeholder="Email"
            value={email}
            className="outline-none border-[1px] pl-10 pr-3 border-white/20 w-full rounded-lg py-2 bg-transparent placeholder:text-gray-500"
            onChange={(e) => setEmail(e.target.value)}
            required
            />
        </div>
        <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-black" />
            <input
            type="password"
            placeholder="Password"
            value={password}
            className="outline-none border-[1px] pl-10 pr-3 border-white/20 w-full rounded-lg py-2 bg-transparent placeholder:text-gray-500"
            onChange={(e) => setPassword(e.target.value)}
            required
            />
        </div>
         <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-black" />
            <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            className="outline-none border-[1px] pl-10 pr-3 border-white/20 w-full rounded-lg py-2 bg-transparent placeholder:text-gray-500"
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            />
        </div>
        <Button variant="outline" className='w-full cursor-pointer bg-white/10 hover:bg-white/20 text-black font-semibold' type='submit'>Create Account</Button>
      </form>

      <div className="relative my-6 w-full">
        <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/20"></span>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white/10 px-2 text-black rounded-full">Or continue with</span>
        </div>
      </div>

      <div className="w-full">
          <Button onClick={handleGoogleSignUp} className="bg-[#DB4437] text-white hover:bg-[#DB4437]/90 w-full font-semibold">
            <RiGoogleFill className="mr-2 h-5 w-5" />
            Sign up with Google
          </Button>
          {error && <p className="text-red-400 text-xs mt-3 text-center">{error}</p>}
      </div>
       <p className="text-xs text-center text-gray-800 mt-6">
        Already have an account?{" "}
        <Link href="/sign-in" className="underline hover:text-black font-semibold">
          Sign In
        </Link>
      </p>
    </div>
  );
}

