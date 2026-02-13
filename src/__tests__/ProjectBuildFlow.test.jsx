import { act, fireEvent, render, screen, within } from '@testing-library/react'
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

const openProjects = async (user) => {
  await user.click(screen.getByRole('button', { name: 'Projects' }))
}

const BUILD_MS = 2400

describe('Project build flow', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows unbuilt state by default', async () => {
    renderExplorer()
    const user = userEvent.setup()
    await openProjects(user)

    expect(
      screen.getByRole('button', {
        name: /click to build project web dev resume/i,
      })
    ).toBeInTheDocument()
  })

  it('builds a project and persists state', async () => {
    vi.useFakeTimers()
    renderExplorer()
    fireEvent.click(screen.getByRole('button', { name: 'Projects' }))

    const card = screen.getByRole('article', {
      name: 'Project: Web Dev Resume',
    })
    const buildButton = within(card).getByRole('button', {
      name: /click to build project web dev resume/i,
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
      screen.getByRole('heading', { name: 'Web Dev Resume' })
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Code' })).toBeInTheDocument()

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    expect(stored['project-4']).toBe('built')
  })

  it('does not start multiple builds while building', async () => {
    vi.useFakeTimers()
    renderExplorer()
    fireEvent.click(screen.getByRole('button', { name: 'Projects' }))

    const buildButton = screen.getByRole('button', {
      name: /click to build project web dev resume/i,
    })

    await act(async () => {
      fireEvent.click(buildButton)
    })
    const timersAfterFirstClick = vi.getTimerCount()

    const buildingButton = screen.getByRole('button', { name: /building/i })
    await act(async () => {
      fireEvent.click(buildingButton)
    })
    expect(vi.getTimerCount()).toBe(timersAfterFirstClick)
  })

  it('loads built state from localStorage', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ 'project-4': 'built' })
    )

    renderExplorer()
    const user = userEvent.setup()
    await openProjects(user)

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
