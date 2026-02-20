import { render, screen } from '@testing-library/react'
import { useContext } from 'react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Explorer from '../routes/Explorer'
import { XPContext, XPProvider } from '../contexts/XPContext'
import { reloadPage } from '../utils/reloadPage'

vi.mock('../utils/reloadPage', () => ({
  reloadPage: vi.fn(),
}))

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

describe('Explorer navigation', () => {
  const originalImage = global.Image

  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    global.Image = originalImage
  })

  it('shows Summary content by default', () => {
    renderExplorer()
    expect(screen.getByText('Character Summary')).toBeInTheDocument()
  })

  it('updates RenderWindow when a nav item is clicked', async () => {
    const user = userEvent.setup()
    renderExplorer()

    await user.click(screen.getByRole('button', { name: 'Projects' }))
    expect(
      screen.getByRole('button', {
        name: /click to build project web dev resume/i,
      })
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Levels' }))
    expect(
      screen.getByRole('button', {
        name: /click to enroll lighthouse labs/i,
      })
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Statistics' }))
    expect(
      screen.getByText(/install api first to unlock github stats/i)
    ).toBeInTheDocument()
  })

  it('does not grant extra XP when navigating between Projects and Experience', async () => {
    localStorage.setItem(
      'project-build-states',
      JSON.stringify({ 'project-4': 'built' })
    )
    const user = userEvent.setup()
    renderExplorerWithXpDisplay()

    await user.click(screen.getByRole('button', { name: 'Projects' }))
    expect(
      screen.getByRole('heading', { name: 'Web Dev Resume' })
    ).toBeInTheDocument()
    expect(screen.getByTestId('xp-total')).toHaveTextContent('27')

    await user.click(screen.getByRole('button', { name: 'Experience' }))
    expect(screen.getByText('Crew Supervisor')).toBeInTheDocument()
    expect(screen.getByTestId('xp-total')).toHaveTextContent('27')

    await user.click(screen.getByRole('button', { name: 'Projects' }))
    expect(
      screen.getByRole('heading', { name: 'Web Dev Resume' })
    ).toBeInTheDocument()
    expect(screen.getByTestId('xp-total')).toHaveTextContent('27')
  })

  it('does not grant extra XP when navigating from Experience to Projects', async () => {
    localStorage.setItem(
      'project-build-states',
      JSON.stringify({ 'experience-1': 'built' })
    )
    const user = userEvent.setup()
    renderExplorerWithXpDisplay()

    await user.click(screen.getByRole('button', { name: 'Experience' }))
    expect(screen.getByText('Crew Supervisor')).toBeInTheDocument()
    expect(screen.getByTestId('xp-total')).toHaveTextContent('27')

    await user.click(screen.getByRole('button', { name: 'Projects' }))
    expect(
      screen.getByRole('button', {
        name: /click to build project web dev resume/i,
      })
    ).toBeInTheDocument()
    expect(screen.getByTestId('xp-total')).toHaveTextContent('27')
  })

  it('preloads the map image on mount', () => {
    const sources = []
    class MockImage {
      set src(value) {
        sources.push(value)
      }
    }

    global.Image = MockImage
    renderExplorer()

    expect(sources.some((src) => String(src).includes('resumeMap'))).toBe(true)
  })

  it('resets local state and reloads when confirmed', async () => {
    const user = userEvent.setup()
    const confirmSpy = vi
      .spyOn(window, 'confirm')
      .mockImplementation(() => true)

    localStorage.setItem('project-build-states', JSON.stringify({ test: 'ok' }))
    localStorage.setItem('xp-state', JSON.stringify({ xp: 99 }))
    localStorage.setItem('xp-bar-state', JSON.stringify({ displayLevel: 2 }))
    localStorage.setItem('theme', 'cyber')
    document.documentElement.dataset.theme = 'cyber'

    renderExplorer()

    await user.click(screen.getByRole('button', { name: 'Reset' }))

    expect(confirmSpy).toHaveBeenCalled()
    expect(localStorage.getItem('project-build-states')).toBeNull()
    expect(localStorage.getItem('xp-state')).toBeNull()
    expect(localStorage.getItem('xp-bar-state')).toBeNull()
    expect(localStorage.getItem('theme')).toBeNull()
    expect(document.documentElement.dataset.theme).toBe('')
    expect(reloadPage).toHaveBeenCalled()

    confirmSpy.mockRestore()
  })

  it('keeps local state when reset is canceled', async () => {
    const user = userEvent.setup()
    const confirmSpy = vi
      .spyOn(window, 'confirm')
      .mockImplementation(() => false)

    localStorage.setItem('project-build-states', JSON.stringify({ test: 'ok' }))
    localStorage.setItem('xp-state', JSON.stringify({ xp: 99 }))
    localStorage.setItem('xp-bar-state', JSON.stringify({ displayLevel: 2 }))
    localStorage.setItem('theme', 'cyber')
    document.documentElement.dataset.theme = 'cyber'

    renderExplorer()

    await user.click(screen.getByRole('button', { name: 'Reset' }))

    expect(confirmSpy).toHaveBeenCalled()
    expect(localStorage.getItem('project-build-states')).not.toBeNull()
    expect(localStorage.getItem('xp-state')).not.toBeNull()
    expect(localStorage.getItem('xp-bar-state')).not.toBeNull()
    expect(localStorage.getItem('theme')).toBe('cyber')
    expect(document.documentElement.dataset.theme).toBe('cyber')
    expect(reloadPage).not.toHaveBeenCalled()

    confirmSpy.mockRestore()
  })
})
