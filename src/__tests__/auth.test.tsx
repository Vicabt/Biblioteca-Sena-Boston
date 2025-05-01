import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useAuth } from '@/hooks/use-auth'
import { AuthGuard } from '@/components/auth/auth-guard'
import { vi } from 'vitest'

vi.mock('@/hooks/use-auth', () => ({
  useAuth: vi.fn()
}))

describe('AuthGuard', () => {
  it('should redirect to login when not authenticated', () => {
    const mockRouter = { push: vi.fn() }
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      login: vi.fn(),
      logout: vi.fn()
    })

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    )

    expect(mockRouter.push).toHaveBeenCalledWith('/login')
  })

  it('should show content when authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { uid: '123', email: 'test@example.com' },
      loading: false,
      login: vi.fn(),
      logout: vi.fn()
    })

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })
}) 