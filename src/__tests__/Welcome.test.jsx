import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import Welcome from '../routes/Welcome'

const renderWithRoutes = (initialPath = '/') => {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/resume" element={<div>Resume View</div>} />
        <Route path="/explorer" element={<div>Explorer View</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('Welcome', () => {
  it('renders heading and intro text', () => {
    renderWithRoutes('/')
    expect(screen.getByRole('heading', { name: /welcome to my react app!/i })).toBeInTheDocument()
    expect(screen.getByText(/this is the welcome page\./i)).toBeInTheDocument()
  })

  it('renders two navigation buttons', () => {
    renderWithRoutes('/')
    expect(screen.getByRole('button', { name: /go to resume/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /go to explorer/i })).toBeInTheDocument()
  })

  it('navigates to /resume when Resume button is clicked', async () => {
    const user = userEvent.setup()
    renderWithRoutes('/')
    await user.click(screen.getByRole('button', { name: /go to resume/i }))
    expect(screen.getByText('Resume View')).toBeInTheDocument()
  })

  it('navigates to /explorer when Explorer button is clicked', async () => {
    const user = userEvent.setup()
    renderWithRoutes('/')
    await user.click(screen.getByRole('button', { name: /go to explorer/i }))
    expect(screen.getByText('Explorer View')).toBeInTheDocument()
  })
})
