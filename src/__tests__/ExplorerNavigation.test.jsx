import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Explorer from '../routes/Explorer'

const renderExplorer = () => {
  return render(
    <MemoryRouter>
      <Explorer />
    </MemoryRouter>
  )
}

describe('Explorer navigation', () => {
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
})
