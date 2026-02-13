import { act, render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { XPContext } from '../contexts/XPContext'
import PixelHero from '../components/PixelHero'

const renderWithXp = (xp) => {
  return render(
    <XPContext.Provider value={{ xp }}>
      <PixelHero />
    </XPContext.Provider>
  )
}

describe('PixelHero XP bar', () => {
  it('shows level 1 and 0 progress at 0 XP', () => {
    renderWithXp(0)
    expect(screen.getByText('lvl 1')).toBeInTheDocument()
    expect(screen.getByText('0/2 XP')).toBeInTheDocument()
  })

  it('animates through each level without skipping', () => {
    vi.useFakeTimers()
    const fillDurationMs = 400
    const flashDurationMs = 300
    const resetDelayMs = 120
    const { rerender } = renderWithXp(0)

    act(() => {
      rerender(
        <XPContext.Provider value={{ xp: 5 }}>
          <PixelHero />
        </XPContext.Provider>
      )
    })

    expect(screen.getByText('lvl 1')).toBeInTheDocument()
    expect(screen.getByText('0/2 XP')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(1)
    })

    expect(screen.getByText('lvl 1')).toBeInTheDocument()
    expect(screen.getByText('2/2 XP')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(fillDurationMs + flashDurationMs)
    })

    expect(screen.getByText('lvl 2')).toBeInTheDocument()
    expect(screen.getByText('0/2 XP')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(resetDelayMs)
    })

    act(() => {
      vi.advanceTimersByTime(1)
    })

    expect(screen.getByText('lvl 2')).toBeInTheDocument()
    expect(screen.getByText('2/2 XP')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(fillDurationMs + flashDurationMs)
    })

    expect(screen.getByText('lvl 3')).toBeInTheDocument()
    expect(screen.getByText('0/2 XP')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(resetDelayMs)
    })

    expect(screen.getByText('lvl 3')).toBeInTheDocument()
    expect(screen.getByText('1/2 XP')).toBeInTheDocument()

    vi.useRealTimers()
  })
})