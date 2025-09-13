"use client";
import { auth } from "@/lib/firebaseConfig";
import { signOut } from "firebase/auth";


export default function LogoutButton() {
  const handleLogout = async () => {
    await signOut(auth);
  };

  return <button onClick={handleLogout} className="text-rose-800">Logout</button>;
}