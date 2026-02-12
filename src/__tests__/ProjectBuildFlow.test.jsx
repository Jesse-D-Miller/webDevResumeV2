import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import Explorer from '../routes/Explorer'

const STORAGE_KEY = 'project-build-states'

const renderExplorer = () => {
  return render(
    <MemoryRouter>
      <Explorer />
    </MemoryRouter>
  )
}

const openProjects = async () => {
  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: 'Projects' }))
  return user
}

describe('Project build flow', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows unbuilt state by default', async () => {
    renderExplorer()
    await openProjects()

    expect(
      screen.getByRole('button', { name: 'Build: Web Dev Resume' })
    ).toBeInTheDocument()
  })

  it('builds a project and persists state', async () => {
    vi.useFakeTimers()
    renderExplorer()
    const user = await openProjects()

    const buildButton = screen.getByRole('button', {
      name: 'Build: Web Dev Resume',
    })

    await user.click(buildButton)

    const card = screen.getByRole('article', {
      name: 'Project: Web Dev Resume',
    })

    expect(card).toHaveAttribute('aria-busy', 'true')
    expect(buildButton).toBeDisabled()
    expect(buildButton).toHaveTextContent('Building...')

    await vi.runAllTimersAsync()

    expect(card).toHaveAttribute('aria-busy', 'false')
    expect(
      screen.getByRole('heading', { name: 'Web Dev Resume' })
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Code' })).toBeInTheDocument()

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    expect(stored['project-4']).toBe('built')
  })

  it('does not start multiple builds while building', async () => {
    vi.useFakeTimers()
    renderExplorer()
    const user = await openProjects()

    const buildButton = screen.getByRole('button', {
      name: 'Build: Web Dev Resume',
    })

    await user.click(buildButton)
    const timersAfterFirstClick = vi.getTimerCount()

    await user.click(buildButton)
    expect(vi.getTimerCount()).toBe(timersAfterFirstClick)
  })

  it('loads built state from localStorage', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ 'project-4': 'built' })
    )

    renderExplorer()
    await openProjects()

    const card = screen.getByRole('article', {
      name: 'Project: Web Dev Resume',
    })

    expect(card).toHaveAttribute('aria-busy', 'false')
    expect(
      screen.getByRole('heading', { name: 'Web Dev Resume' })
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Code' })).toBeInTheDocument()
  })
})
