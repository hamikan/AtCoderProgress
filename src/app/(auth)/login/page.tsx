'use client'

import { signIn } from "next-auth/react"
import { useState } from "react"

export default function LoginPage() {
  const [atcoderId, setAtcoderId] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await signIn("credentials", {
      atcoderId,
      password,
      callbackUrl: `/${atcoderId}`,
    })
  }

  return (
    <div>
      <h1>Login to AtCoder</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="atcoderId">AtCoder ID</label>
          <input
            id="atcoderId"
            type="text"
            value={atcoderId}
            onChange={(e) => setAtcoderId(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  )
}
