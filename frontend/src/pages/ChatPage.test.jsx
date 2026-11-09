import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ChatPage from './ChatPage'

// Mock scrollIntoView since jsdom doesn't support it
beforeEach(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn()
  vi.restoreAllMocks()
})

afterEach(() => {
  vi.clearAllTimers()
})

describe('ChatPage Component', () => {
  it('renders header with Dr. Anahitha avatar, AI companion label, and permanent Call 112 button', () => {
    render(
      <MemoryRouter>
        <ChatPage />
      </MemoryRouter>
    )

    // Avatar image
    const avatar = screen.getByAltText('Dr. Anahitha')
    expect(avatar).toBeDefined()
    expect(avatar.getAttribute('src')).toBe('/dr-anahitha.png')

    // AI Companion label
    expect(screen.getByText('AI Companion, not a doctor')).toBeDefined()

    // Permanent Call 112 button in header
    const call112Btn = screen.getByRole('link', { name: /call 112/i })
    expect(call112Btn).toBeDefined()
    expect(call112Btn.getAttribute('href')).toBe('tel:112')

    // Demo notice
    expect(
      screen.getByText("Demo only. Please don't share real personal health details.")
    ).toBeDefined()
  })

  it('renders all five mode chips and changes active mode on click', () => {
    render(
      <MemoryRouter>
        <ChatPage />
      </MemoryRouter>
    )

    const modeNav = screen.getByRole('navigation', { name: /conversation modes/i })
    expect(modeNav).toBeDefined()

    const expectedModes = [
      '24/7 Chat',
      'Understand Symptoms',
      'Health Information',
      'Personalized Guidance',
      'Lifestyle & Wellness',
    ]

    expectedModes.forEach((modeName) => {
      const chip = Array.from(modeNav.querySelectorAll('button')).find((btn) =>
        btn.textContent.includes(modeName)
      )
      expect(chip).toBeDefined()
    })

    // Click "Understand Symptoms" mode chip in navigation bar
    const symptomsChip = Array.from(modeNav.querySelectorAll('button')).find((btn) =>
      btn.textContent.includes('Understand Symptoms')
    )
    fireEvent.click(symptomsChip)
    expect(symptomsChip.getAttribute('aria-pressed')).toBe('true')
  })

  it('displays character counter and enforces 1000 character maximum', () => {
    render(
      <MemoryRouter>
        <ChatPage />
      </MemoryRouter>
    )

    const input = screen.getByLabelText(/message dr\. anahitha/i)
    expect(screen.getByText('0/1000')).toBeDefined()

    fireEvent.change(input, { target: { value: 'How can I sleep better?' } })
    expect(screen.getByText('23/1000')).toBeDefined()
    expect(input.getAttribute('maxlength')).toBe('1000')
  })

  // --- 3. Safety: Emergency Interception Tests ---

  it('intercepts physical emergency phrase BEFORE sending, displays emergency card with Call 112 & /emergency link, and DOES NOT call backend', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch')

    render(
      <MemoryRouter>
        <ChatPage />
      </MemoryRouter>
    )

    const input = screen.getByLabelText(/message dr\. anahitha/i)
    const sendBtn = screen.getByLabelText(/send message/i)

    // User types acute emergency symptom
    fireEvent.change(input, { target: { value: 'I have severe crushing chest pain and cannot breathe' } })
    fireEvent.click(sendBtn)

    // Must NOT call backend fetch
    expect(fetchSpy).not.toHaveBeenCalled()

    // Must display emergency card
    const emergencyCard = await screen.findByTestId('emergency-card')
    expect(emergencyCard).toBeDefined()

    // Must contain Call 112 button
    const emergencyCallBtn = withinElement(emergencyCard, 'Call 112')
    expect(emergencyCallBtn).toBeDefined()
    expect(emergencyCallBtn.getAttribute('href')).toBe('tel:112')

    // Must contain link to /emergency
    const guidesLink = emergencyCard.querySelector('a[href="/emergency"]')
    expect(guidesLink).toBeDefined()

    // Must contain non-diagnostic emergency guidance
    expect(
      screen.getByText(/these symptoms can be a sign of a serious emergency\. call 112 now/i)
    ).toBeDefined()
  })

  it('intercepts self-harm wording with the caring crisis message and 112 direction, and DOES NOT call backend', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch')

    render(
      <MemoryRouter>
        <ChatPage />
      </MemoryRouter>
    )

    const input = screen.getByLabelText(/message dr\. anahitha/i)
    const sendBtn = screen.getByLabelText(/send message/i)

    fireEvent.change(input, { target: { value: 'I feel hopeless and I want to die' } })
    fireEvent.click(sendBtn)

    expect(fetchSpy).not.toHaveBeenCalled()

    const emergencyCard = await screen.findByTestId('emergency-card')
    expect(emergencyCard).toBeDefined()
    expect(
      screen.getByText(/i'm really sorry you're going through this, and i'm glad you told me/i)
    ).toBeDefined()
  })

  it('renders emergency card when backend returns emergency=true', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        reply: 'These symptoms can be a sign of a serious emergency. Call 112 now. ANAHITHA cannot contact emergency services or dispatch help for you.',
        emergency: true,
        category: 'CARDIAC',
        error: null,
      }),
    })

    render(
      <MemoryRouter>
        <ChatPage />
      </MemoryRouter>
    )

    const input = screen.getByLabelText(/message dr\. anahitha/i)
    const sendBtn = screen.getByLabelText(/send message/i)

    // Benign query that server responds with emergency flag
    fireEvent.change(input, { target: { value: 'My chest feels unusual today' } })
    fireEvent.click(sendBtn)

    const emergencyCard = await screen.findByTestId('emergency-card')
    expect(emergencyCard).toBeDefined()
    expect(emergencyCard.querySelector('a[href="tel:112"]')).toBeDefined()
    expect(emergencyCard.querySelector('a[href="/emergency"]')).toBeDefined()
  })

  // --- 4. Markdown Assistant Replies ---

  it('renders assistant replies as formatted markdown', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        reply: '### Hydration Advice\n\n* **Drink water:** Keep a water bottle nearby.\n* **Eat fruits:** Watermelon is great.',
        emergency: false,
        error: null,
      }),
    })

    render(
      <MemoryRouter>
        <ChatPage />
      </MemoryRouter>
    )

    const input = screen.getByLabelText(/message dr\. anahitha/i)
    const sendBtn = screen.getByLabelText(/send message/i)

    fireEvent.change(input, { target: { value: 'Tips for hydration?' } })
    fireEvent.click(sendBtn)

    await waitFor(() => {
      // Bold items rendered by react-markdown
      expect(screen.getByText('Drink water:')).toBeDefined()
      expect(screen.getByText('Eat fruits:')).toBeDefined()
    })
  })

  // --- 5. Error State, 112 Reminder, and Retry Button ---

  it('shows friendly error, 112 reminder, and Retry button when backend is unreachable, and retries on click', async () => {
    // 1st call fails
    const fetchSpy = vi.spyOn(global, 'fetch')
      .mockRejectedValueOnce(new Error('Network connection failed'))
      // 2nd call (retry) succeeds
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          reply: 'Here are simple sleep tips after retrying.',
          emergency: false,
          error: null,
        }),
      })

    render(
      <MemoryRouter>
        <ChatPage />
      </MemoryRouter>
    )

    const input = screen.getByLabelText(/message dr\. anahitha/i)
    const sendBtn = screen.getByLabelText(/send message/i)

    fireEvent.change(input, { target: { value: 'How can I sleep better?' } })
    fireEvent.click(sendBtn)

    // Error card appears
    const errorCard = await screen.findByTestId('error-card')
    expect(errorCard).toBeDefined()
    expect(screen.getByText(/temporarily unable to connect to the knowledge engine/i)).toBeDefined()
    expect(screen.getByText(/for urgent health issues, please dial/i)).toBeDefined()

    // Retry button is available
    const retryBtn = screen.getByRole('button', { name: /retry/i })
    expect(retryBtn).toBeDefined()

    // Click retry
    fireEvent.click(retryBtn)

    // Expect second fetch call
    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(2)
      expect(screen.getByText(/here are simple sleep tips after retrying/i)).toBeDefined()
    })
  })

  // --- 4b. Typing Indicator & 5-Second Wait Notice ---

  it('shows typing indicator while waiting, and adds 15-second notice if waiting >= 5 seconds', async () => {
    vi.useFakeTimers()

    // Long running fetch promise
    let resolveFetch
    const pendingPromise = new Promise((resolve) => {
      resolveFetch = resolve
    })
    vi.spyOn(global, 'fetch').mockImplementationOnce(() => pendingPromise)

    render(
      <MemoryRouter>
        <ChatPage />
      </MemoryRouter>
    )

    const input = screen.getByLabelText(/message dr\. anahitha/i)
    const sendBtn = screen.getByLabelText(/send message/i)

    fireEvent.change(input, { target: { value: 'What is blood pressure?' } })
    fireEvent.click(sendBtn)

    // Typing indicator should be visible
    expect(screen.getByTestId('typing-indicator')).toBeDefined()
    expect(screen.queryByTestId('slow-warning')).toBeNull()

    // Fast-forward 5 seconds
    act(() => {
      vi.advanceTimersByTime(5000)
    })

    // Notice should now be present
    expect(screen.getByTestId('slow-warning')).toBeDefined()
    expect(
      screen.getByText('Still thinking, this can take up to 15 seconds.')
    ).toBeDefined()

    // Resolve fetch
    await act(async () => {
      resolveFetch({
        ok: true,
        json: async () => ({
          reply: 'Blood pressure is the force of your blood against artery walls.',
          emergency: false,
          error: null,
        }),
      })
    })

    // Indicator disappears
    expect(screen.queryByTestId('typing-indicator')).toBeNull()
    expect(screen.getByText(/force of your blood against artery walls/i)).toBeDefined()

    vi.useRealTimers()
  })
})

// Helper function to find element within container
function withinElement(container, text) {
  const links = container.querySelectorAll('a, button')
  for (const el of links) {
    if (el.textContent.includes(text)) return el
  }
  return null
}
