'use client'

import { SessionProvider } from "next-auth/react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "sonner"

export default function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider><TooltipProvider>{children}</TooltipProvider><Toaster /></SessionProvider>
}
