import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ChatPage from './ChatPage'
import { AuthProvider } from '../context/AuthContext'

function renderChat() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <ChatPage />
      </AuthProvider>
    </MemoryRouter>
  )
}

describe('Phase 5 - English Voice Integration', () => {
  let mockSpeak
  let mockCancel
  let mockGetVoices

  beforeEach(() => {
    vi.restoreAllMocks()
    window.HTMLElement.prototype.scrollIntoView = vi.fn()
    window.fetch = vi.fn()

    delete window.SpeechRecognition
    delete window.webkitSpeechRecognition

    // Setup speech synthesis mock
    mockSpeak = vi.fn()
    mockCancel = vi.fn()
    mockGetVoices = vi.fn().mockReturnValue([
      { name: 'Google US English', lang: 'en-US' },
    ])

    window.speechSynthesis = {
      speak: mockSpeak,
      cancel: mockCancel,
      getVoices: mockGetVoices,
      speaking: false,
    }

    // Mock global SpeechSynthesisUtterance
    window.SpeechSynthesisUtterance = vi.fn().mockImplementation(function (text) {
      this.text = text
      this.lang = 'en-US'
      this.voice = null
    })
  })

  afterEach(() => {
    delete window.SpeechRecognition
    delete window.webkitSpeechRecognition
    delete window.speechSynthesis
    delete window.SpeechSynthesisUtterance
  })

  it('shows unsupported note when SpeechRecognition is unavailable in the browser', () => {
    renderChat()

    expect(
      screen.getByText("Voice input isn't supported in this browser, but you can always type.")
    ).toBeDefined()
    expect(screen.queryByTestId('mic-button')).toBeNull()
  })

  it('renders mic button and toggles listening when SpeechRecognition is supported', () => {
    const mockStart = vi.fn(function () {
      if (this.onstart) this.onstart()
    })
    const mockStop = vi.fn(function () {
      if (this.onend) this.onend()
    })

    window.SpeechRecognition = vi.fn().mockImplementation(function () {
      this.start = mockStart
      this.stop = mockStop
      this.abort = vi.fn()
    })

    renderChat()

    const micButton = screen.getByTestId('mic-button')
    expect(micButton).toBeDefined()

    // Click mic to start
    act(() => {
      fireEvent.click(micButton)
    })
    expect(mockStart).toHaveBeenCalled()
    expect(screen.getByText(/Listening... speak clearly in English/i)).toBeDefined()

    // Click stop on listening indicator or mic button
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /^stop$/i }))
    })
    expect(mockStop).toHaveBeenCalled()
  })

  it('shows polite note when microphone permission is denied', () => {
    window.SpeechRecognition = vi.fn().mockImplementation(function () {
      this.start = vi.fn(function () {
        if (this.onerror) {
          this.onerror({ error: 'not-allowed' })
        }
      })
      this.stop = vi.fn()
      this.abort = vi.fn()
    })

    renderChat()

    const micButton = screen.getByTestId('mic-button')
    act(() => {
      fireEvent.click(micButton)
    })

    expect(
      screen.getByText(/Microphone access was blocked. You can still type your message./i)
    ).toBeDefined()
  })

  it('intercepts emergency speech input before sending to Gemini and does NOT speak it aloud', async () => {
    let capturedRecognition = null
    window.SpeechRecognition = vi.fn().mockImplementation(function () {
      this.start = vi.fn()
      this.stop = vi.fn()
      this.abort = vi.fn()
      capturedRecognition = this
    })

    renderChat()

    const micButton = screen.getByTestId('mic-button')
    act(() => {
      fireEvent.click(micButton)
    })

    // Simulate voice recognizing an acute emergency symptom
    act(() => {
      capturedRecognition.onresult({
        results: [[{ transcript: "I have severe chest pain and can't breathe" }]],
      })
    })

    // Verify user message appears
    expect(
      screen.getByText("I have severe chest pain and can't breathe")
    ).toBeDefined()

    // Verify emergency card is displayed with Call 112 button and guide link
    expect(screen.getByTestId('emergency-card')).toBeDefined()
    expect(screen.getAllByRole('link', { name: /call 112/i })[0]).toBeDefined()

    // Safety constraint: Gemini fetch was NEVER called
    expect(window.fetch).not.toHaveBeenCalled()

    // Safety constraint: SpeechSynthesis was cancelled and NEVER spoke the emergency text
    expect(mockCancel).toHaveBeenCalled()
    expect(mockSpeak).not.toHaveBeenCalled()
  })

  it('provides Read Aloud on regular assistant replies and allows stopping playback', async () => {
    renderChat()

    // Find the initial welcome message from Dr. Anahitha
    const readAloudBtn = screen.getByTestId('tts-button-welcome')
    expect(readAloudBtn).toBeDefined()

    // Click Read Aloud
    act(() => {
      fireEvent.click(readAloudBtn)
    })
    expect(mockCancel).toHaveBeenCalled()
    expect(mockSpeak).toHaveBeenCalledTimes(1)
    expect(screen.getByText(/Speaking in English.../i)).toBeDefined()

    // Button transitions to Stop
    const stopBtn = screen.getByRole('button', { name: /Stop reading aloud/i })
    expect(stopBtn).toBeDefined()

    // Click Stop
    act(() => {
      fireEvent.click(stopBtn)
    })
    expect(mockCancel).toHaveBeenCalledTimes(2)
  })

  it('guarantees emergency messages NEVER have a Read Aloud speaker button', () => {
    renderChat()

    const input = screen.getByRole('textbox', { name: /Message Dr. Anahitha/i })
    act(() => {
      fireEvent.change(input, { target: { value: 'someone collapsed and is unresponsive' } })
      fireEvent.submit(input.closest('form'))
    })

    // Emergency card is shown
    const emergencyCard = screen.getByTestId('emergency-card')
    expect(emergencyCard).toBeDefined()

    // Assert no TTS button exists within the emergency card or for the emergency message
    const buttons = emergencyCard.querySelectorAll('button')
    const hasTtsButton = Array.from(buttons).some((b) =>
      b.getAttribute('aria-label')?.includes('Read aloud')
    )
    expect(hasTtsButton).toBe(false)
  })
})
