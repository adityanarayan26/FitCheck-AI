"use client";
import { useState } from "react";
import { RiGoogleFill } from "@remixicon/react";
import { signInWithPopup, createUserWithEmailAndPassword } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebaseConfig"; // Assuming firebaseConfig exports auth and googleProvider
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/dashboard"); // Redirect to dashboard on successful sign-up
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSignUp = async () => {
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/dashboard"); // Redirect to dashboard on successful sign-up
    } catch (err) {
      // Don't show an error if the user intentionally closes the popup
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message);
      }
    }
  };

  return (
    <div className="h-fit w-[300px] flex flex-col items-center justify-center bg-white/20 p-10 rounded-xl shadow-xl text-white">
      <form onSubmit={handleEmailSignUp} className="flex flex-col justify-between items-start gap-y-5 mb-4 w-full">
       <h1 className="text-3xl font-semibold">Create Account</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          className="outline-none border-[1px] pl-2 border-white/20 w-full rounded-lg py-2 bg-transparent placeholder:text-gray-300"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          className="outline-none border-[1px] border-white/20 w-full rounded-lg pl-2 py-2 bg-transparent placeholder:text-gray-300"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button variant="outline" className='cursor-pointer bg-transparent hover:bg-white/10' type='submit'>Sign Up</Button>
      </form>

      <div className="w-full flex flex-col gap-y-3">
          <Button onClick={handleGoogleSignUp} className="bg-[#DB4437] text-white after:flex-1 hover:bg-[#DB4437]/90 w-full">
            <span className="pointer-events-none me-2 flex-1">
              <RiGoogleFill className="opacity-60" size={16} aria-hidden="true" />
            </span>
            Sign up with Google
          </Button>
          {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
      </div>
    </div>
  );
}

