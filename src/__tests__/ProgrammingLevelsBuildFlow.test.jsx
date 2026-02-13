import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { useContext } from 'react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import Explorer from '../routes/Explorer'
import { XPContext, XPProvider } from '../contexts/XPContext'

const STORAGE_KEY = 'project-build-states'
const BUILD_MS = 2400

const renderExplorer = () => {
  return render(
    <XPProvider>
      <MemoryRouter>
        <Explorer />
      </MemoryRouter>
    </XPProvider>
  )
}

const renderExplorerWithXpDisplay = () => {
  const XPDisplay = () => {
    const { xp } = useContext(XPContext)
    return <span data-testid="xp-total">{xp}</span>
  }

  return render(
    <XPProvider>
      <XPDisplay />
      <MemoryRouter>
        <Explorer />
      </MemoryRouter>
    </XPProvider>
  )
}

const openLevels = async (user) => {
  await user.click(screen.getByRole('button', { name: 'Levels' }))
}

describe('ProgrammingLevels build flow', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows unbuilt state by default', async () => {
    renderExplorer()
    const user = userEvent.setup()
    await openLevels(user)

    expect(
      screen.getByRole('button', {
        name: /click to build education lighthouse labs/i,
      })
    ).toBeInTheDocument()
  })

  it('builds education and persists state', async () => {
    vi.useFakeTimers()
    renderExplorer()
    fireEvent.click(screen.getByRole('button', { name: 'Levels' }))

    const card = screen.getByRole('article', {
      name: 'Education: Lighthouse Labs',
    })
    const buildButton = within(card).getByRole('button', {
      name: /click to build education lighthouse labs/i,
    })

    await act(async () => {
      fireEvent.click(buildButton)
    })

    expect(card).toHaveAttribute('aria-busy', 'true')
    const buildingButton = within(card).getByRole('button', {
      name: /building/i,
    })
    expect(buildingButton).toBeDisabled()
    expect(buildingButton).toHaveTextContent('Building...')

    await act(async () => {
      vi.advanceTimersByTime(BUILD_MS + 50)
    })

    expect(card).toHaveAttribute('aria-busy', 'false')
    expect(
      screen.getByRole('heading', { name: 'Lighthouse Labs' })
    ).toBeInTheDocument()

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    expect(stored['education-1']).toBe('built')
  })

  it('awards 7 XP for education build', async () => {
    vi.useFakeTimers()
    renderExplorerWithXpDisplay()
    fireEvent.click(screen.getByRole('button', { name: 'Levels' }))

    const buildButton = screen.getByRole('button', {
      name: /click to build education lighthouse labs/i,
    })

    await act(async () => {
      fireEvent.click(buildButton)
    })

    await act(async () => {
      vi.advanceTimersByTime(BUILD_MS + 50)
    })

    expect(screen.getByTestId('xp-total')).toHaveTextContent('7')
  })
})
