'use client'

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AuthForm } from "@/components/auth-form"
import { Sparkles } from "lucide-react"

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
    <div className="min-h-[70vh] flex flex-col justify-center py-12">
      <div className="text-center mb-8 px-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl shadow-lg shadow-violet-500/25 mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Join MediaShare</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Create an account to get started</p>
      </div>
      <AuthForm />
    </div>
  )
}
