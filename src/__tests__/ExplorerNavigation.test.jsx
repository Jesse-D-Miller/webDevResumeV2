import { render, screen } from '@testing-library/react'
import { useContext } from 'react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Explorer from '../routes/Explorer'
import { XPContext, XPProvider } from '../contexts/XPContext'

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
  beforeEach(() => {
    localStorage.clear()
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
    expect(screen.getByText('ProgrammingLevels Page')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Statistics' }))
    expect(screen.getByText('Stats Page')).toBeInTheDocument()
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
    expect(screen.getByTestId('xp-total')).toHaveTextContent('5')

    await user.click(screen.getByRole('button', { name: 'Experience' }))
    expect(screen.getByText('Crew Supervisor')).toBeInTheDocument()
    expect(screen.getByTestId('xp-total')).toHaveTextContent('5')

    await user.click(screen.getByRole('button', { name: 'Projects' }))
    expect(
      screen.getByRole('heading', { name: 'Web Dev Resume' })
    ).toBeInTheDocument()
    expect(screen.getByTestId('xp-total')).toHaveTextContent('5')
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
    expect(screen.getByTestId('xp-total')).toHaveTextContent('4')

    await user.click(screen.getByRole('button', { name: 'Projects' }))
    expect(
      screen.getByRole('button', {
        name: /click to build project web dev resume/i,
      })
    ).toBeInTheDocument()
    expect(screen.getByTestId('xp-total')).toHaveTextContent('4')
  })
})
