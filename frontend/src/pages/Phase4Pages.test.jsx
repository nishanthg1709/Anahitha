import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import PrivacyPage from './PrivacyPage'
import SettingsPage from './SettingsPage'
import HistoryPage from './HistoryPage'
import { AuthProvider } from '../context/AuthContext'

beforeEach(() => {
  window.confirm = vi.fn(() => true)
  window.HTMLElement.prototype.scrollIntoView = vi.fn()
  vi.restoreAllMocks()
})

describe('Phase 4 Pages: Privacy, Settings, and History', () => {
  it('PrivacyPage clearly states all mandatory transparency notices', () => {
    render(
      <MemoryRouter>
        <PrivacyPage />
      </MemoryRouter>
    )

    // Demo only
    expect(screen.getByText(/demonstration prototype only/i)).toBeDefined()
    // Do not share real health details
    expect(screen.getByText(/do not share real personal health details/i)).toBeDefined()
    // Data stored in Supabase
    expect(screen.getByText(/data stored in supabase/i)).toBeDefined()
    // Free-tier AI model prompt usage notice
    expect(screen.getByText(/free-tier ai service notice/i)).toBeDefined()
    expect(screen.getByText(/submitted prompts may be processed by google to improve services/i)).toBeDefined()
    // 112 emergency reminder
    expect(screen.getByText(/not for medical emergencies/i)).toBeDefined()
  })

  it('SettingsPage renders "Delete All My Data" button and triggers modal confirmation', () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <SettingsPage />
        </MemoryRouter>
      </AuthProvider>
    )

    const deleteBtn = screen.getByRole('button', { name: /delete all my data/i })
    expect(deleteBtn).toBeDefined()

    // Clicking opens modal
    fireEvent.click(deleteBtn)
    expect(screen.getByText('Delete all data?')).toBeDefined()
    expect(screen.getByRole('button', { name: /yes, delete all/i })).toBeDefined()
  })

  it('HistoryPage lists conversations and expands them on click', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        conversations: [
          {
            id: 'conv-123',
            title: 'Sleep Routine Planning',
            mode: 'wellness',
            created_at: new Date().toISOString(),
            messages: [
              { sender: 'user', content: 'What is a good evening routine?' },
              { sender: 'anahitha', content: 'Dim lights 1 hour before sleep.' },
            ],
          },
        ],
      }),
    })

    render(
      <AuthProvider>
        <MemoryRouter>
          <HistoryPage />
        </MemoryRouter>
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Sleep Routine Planning')).toBeDefined()
    })

    // Open conversation
    const openBtn = screen.getByRole('button', { name: /open/i })
    fireEvent.click(openBtn)

    // Expanded view should now show both messages
    expect(screen.getByText('What is a good evening routine?')).toBeDefined()
    expect(screen.getByText('Dim lights 1 hour before sleep.')).toBeDefined()
  })
})
