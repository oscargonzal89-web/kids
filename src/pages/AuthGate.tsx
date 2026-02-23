import { useState } from 'react'
import { signIn, signUp } from '../services/auth.service'

export default function AuthGate({ onAuthed }: { onAuthed: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  return (
    <div style={{ padding: 40, maxWidth: 360 }}>
      <h2>Auth KIDS (dev)</h2>

      <input
        placeholder="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: '100%', marginBottom: 8 }}
      />

      <input
        placeholder="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ width: '100%', marginBottom: 8 }}
      />

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button
        onClick={async () => {
          try {
            await signIn(email, password)
            onAuthed()
          } catch (e: any) {
            setError(e.message)
          }
        }}
      >
        Login
      </button>

      <button
        style={{ marginLeft: 8 }}
        onClick={async () => {
          try {
            await signUp(email, password)
            onAuthed()
          } catch (e: any) {
            setError(e.message)
          }
        }}
      >
        Registro
      </button>
    </div>
  )
}

