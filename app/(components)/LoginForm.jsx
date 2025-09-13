"use client";
import { useState } from "react";

import { RiFacebookFill, RiGithubFill, RiGoogleFill, RiTwitterXFill } from "@remixicon/react"
import { signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebaseConfig";
import { Button } from "@/components/ui/button";

export default function LogInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    await signInWithEmailAndPassword(auth, email, password);
  };

  const handleGoogleLogin = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  return (
    <div className="h-fit w-[300px] flex flex-col items-center justify-center bg-white/20 p-10 rounded-xl shadow-xl">
      <form onSubmit={handleEmailLogin} className="flex flex-col justify-between items-start gap-y-5 mb-4 w-full">
       <h1 className="text-3xl font-semibold">Sign in</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          className="outline-none border-[1px] pl-2 border-white/20 w-full rounded-lg py-2"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          className="outline-none border-[1px] border-white/20 w-full rounded-lg pl-2 py-2"
          onChange={(e) => setPassword(e.target.value)}
        />
<Button variant="outline" className='cursor-pointer ' type='submit'>Login</Button>
      <Button onClick={handleGoogleLogin} className="bg-[#DB4437] text-white after:flex-1 hover:bg-[#DB4437]/90">
        <span className="pointer-events-none me-2 flex-1">
          <RiGoogleFill className="opacity-60" size={16} aria-hidden="true" />
        </span>
        Login with Google
      </Button>
      </form>

    </div>
  );
}