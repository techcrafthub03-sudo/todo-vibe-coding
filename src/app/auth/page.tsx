"use client";

import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithRedirect, // Changed from signInWithPopup
  signOut,
  User,
  getRedirectResult, // Import this to handle the result
} from "firebase/auth";
import { auth } from "../firebase";
import Image from 'next/image';

const Auth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Handle the redirect result
  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          // This is the signed-in user
          const user = result.user;
          setUser(user);
        }
      })
      .catch((error) => {
        console.error("Error getting redirect result: ", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    // Use signInWithRedirect instead of signInWithPopup
    signInWithRedirect(auth, provider);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex items-center space-x-4">
      {user ? (
        <>
          <Image
            src={user.photoURL || ""}
            alt={user.displayName || ""}
            width={40}
            height={40}
            className="rounded-full"
          />
          <div>
            <p className="font-semibold">{user.displayName}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
          >
            Sign Out
          </button>
        </>
      ) : (
        <button
          onClick={signInWithGoogle}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          Sign in with Google
        </button>
      )}
    </div>
  );
};

export default Auth;
