import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import App from './App'
import { AuthProvider } from './features/auth/context/AuthContext'

describe('App', () => {
  it('renders the onboarding heading', () => {
    expect(renderToString(
      <MemoryRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>,
    )).toContain('Tingkatkan literasimu, mulai hari ini.')
  })
})
