import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import Welcome from '../routes/Welcome'
import resumeData from '../data/resume.json'

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
    expect(
      screen.getByRole('heading', { name: resumeData.meta.name })
    ).toBeInTheDocument()
    expect(screen.getByText(resumeData.meta.title)).toBeInTheDocument()
    expect(screen.getByText(resumeData.meta.location)).toBeInTheDocument()
    expect(screen.getByText(resumeData.meta.availability)).toBeInTheDocument()
  })

  it('renders two navigation buttons', () => {
    renderWithRoutes('/')
    expect(screen.getByRole('button', { name: /resume/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /explorer/i })).toBeInTheDocument()
  })

  it('renders contact links with correct hrefs', () => {
    renderWithRoutes('/')

    const emailLink = screen.getByRole('link', { name: /email/i })
    const githubLink = screen.getByRole('link', { name: /github/i })
    const linkedinLink = screen.getByRole('link', { name: /linkedin/i })
    const resumeLink = screen.getByRole('link', { name: /resume pdf/i })

    expect(emailLink).toHaveAttribute(
      'href',
      `mailto:${resumeData.meta.links.email}`
    )
    expect(githubLink).toHaveAttribute('href', resumeData.meta.links.github)
    expect(linkedinLink).toHaveAttribute('href', resumeData.meta.links.linkedin)
    expect(resumeLink).toHaveAttribute('href', resumeData.meta.links.resumePdf)
  })

  it('navigates to /resume when Resume button is clicked', async () => {
    const user = userEvent.setup()
    renderWithRoutes('/')
    await user.click(screen.getByRole('button', { name: /resume/i }))
    expect(screen.getByText('Resume View')).toBeInTheDocument()
  })

  it('navigates to /explorer when Explorer button is clicked', async () => {
    const user = userEvent.setup()
    renderWithRoutes('/')
    await user.click(screen.getByRole('button', { name: /explorer/i }))
    expect(screen.getByText('Explorer View')).toBeInTheDocument()
  })
})
