'use client'

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AuthForm } from "@/components/auth-form"

export default function RegisterPage() {
  const router = useRouter()

  useEffect(() => {
    async function check() {
      const res = await fetch("/api/auth/me")
      if (res.ok) router.push("/")
    }
    check()
  }, [])

  return (
    <div className="min-h-[70vh] flex flex-col justify-center py-8 sm:py-14">
      <div className="text-center mb-6 sm:mb-8 px-4">
        <div className="text-4xl sm:text-5xl mb-3">🎉</div>
        <h1 className="text-2xl sm:text-3xl font-bold">Join MediaShare</h1>
        <p className="text-gray-500 text-sm sm:text-base mt-1">Create an account to get started</p>
      </div>
      <AuthForm />
    </div>
  )
}
