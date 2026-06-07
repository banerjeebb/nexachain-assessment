import { Suspense } from 'react'
import AuthAside from '@/components/auth/AuthAside'
import RegisterForm from '@/components/auth/RegisterForm'

export default function RegisterPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <AuthAside />
      <main
        className="auth-form-shell"
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px',
        }}
      >
        <Suspense>
          <RegisterForm />
        </Suspense>
      </main>
    </div>
  )
}
