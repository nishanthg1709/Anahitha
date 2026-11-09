import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './AuthContext'
import ProtectedRoute from '../components/ProtectedRoute'
import LoginPage from '../pages/LoginPage'
import SignupPage from '../pages/SignupPage'

function TestComponent() {
  const { user, isGuest, signIn, signOut } = useAuth()
  return (
    <div>
      <span data-testid="auth-status">{isGuest ? 'Guest' : `User: ${user?.email}`}</span>
      <button onClick={() => signIn({ email: 'alex@example.com', password: 'password123' })}>
        Log In Test
      </button>
      <button onClick={() => signOut()}>Log Out Test</button>
    </div>
  )
}

describe('AuthContext and Protected Routes', () => {
  it('initializes as guest and allows guest access', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByTestId('auth-status').textContent).toBe('Guest')
  })

  it('allows sign-in and sign-out updating state', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Sign in
    fireEvent.click(screen.getByRole('button', { name: /log in test/i }))
    await waitFor(() => {
      expect(screen.getByTestId('auth-status').textContent).toBe('User: alex@example.com')
    })

    // Sign out
    fireEvent.click(screen.getByRole('button', { name: /log out test/i }))
    await waitFor(() => {
      expect(screen.getByTestId('auth-status').textContent).toBe('Guest')
    })
  })

  it('ProtectedRoute redirects unauthenticated guests to /login', () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route path="/login" element={<div data-testid="login-view">Login Required</div>} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <div data-testid="dashboard-view">Protected Dashboard</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    )

    // Guest should be redirected to login
    expect(screen.getByTestId('login-view')).toBeDefined()
    expect(screen.queryByTestId('dashboard-view')).toBeNull()
  })

  it('LoginPage renders email/password fields, guest continue link, and emergency 112 button', () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </AuthProvider>
    )

    expect(screen.getByPlaceholderText('you@example.com')).toBeDefined()
    expect(screen.getByPlaceholderText('••••••••')).toBeDefined()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeDefined()

    // Guest link
    expect(screen.getByText(/continue as guest/i)).toBeDefined()

    // Emergency 112 link
    const call112 = screen.getByRole('link', { name: /emergency 112/i })
    expect(call112).toBeDefined()
    expect(call112.getAttribute('href')).toBe('tel:112')
  })

  it('SignupPage renders display name, email, password fields, and guest continue link', () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <SignupPage />
        </MemoryRouter>
      </AuthProvider>
    )

    expect(screen.getByPlaceholderText('Preferred name')).toBeDefined()
    expect(screen.getByPlaceholderText('you@example.com')).toBeDefined()
    expect(screen.getByPlaceholderText('••••••••')).toBeDefined()
    expect(screen.getByRole('button', { name: /create account/i })).toBeDefined()

    // Guest link
    expect(screen.getByText(/continue as guest/i)).toBeDefined()
  })
})
