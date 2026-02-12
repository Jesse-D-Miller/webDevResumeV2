import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import NavTop from '../components/NavTop'
import data from '../data/resume.json'

describe('NavTop', () => {
  it('renders the name, location, and job title', () => {
    render(<NavTop />)

    expect(
      screen.getByRole('heading', { name: data.meta.name })
    ).toBeInTheDocument()
    expect(screen.getByText(data.meta.location)).toBeInTheDocument()
    expect(screen.getByText(data.meta.title)).toBeInTheDocument()
  })

  it('renders availability status', () => {
    render(<NavTop />)
    expect(screen.getByText(data.meta.availability)).toBeInTheDocument()
  })

  it('renders contact links with correct hrefs', () => {
    render(<NavTop />)

    const emailLink = screen.getByRole('link', { name: /email/i })
    const githubLink = screen.getByRole('link', { name: /github/i })
    const linkedinLink = screen.getByRole('link', { name: /linkedin/i })

    expect(emailLink).toHaveAttribute('href', `mailto:${data.meta.links.email}`)
    expect(githubLink).toHaveAttribute('href', data.meta.links.github)
    expect(linkedinLink).toHaveAttribute('href', data.meta.links.linkedin)
  })
})
