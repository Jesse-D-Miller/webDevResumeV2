import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, beforeEach } from 'vitest'
import Explorer from '../routes/Explorer'
import { XPProvider } from '../contexts/XPContext'

const STORAGE_KEY = 'project-build-states'

const renderExplorer = () => {
  return render(
    <XPProvider>
      <MemoryRouter>
        <Explorer />
      </MemoryRouter>
    </XPProvider>
  )
}

describe('SkillsPills activation', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders all skills as grayscale when no projects are built', () => {
    renderExplorer()

    const reactPill = screen.getByText('React')
    const leadershipPill = screen.getByText('Leadership')

    expect(reactPill).not.toHaveClass('skills-pills-pill--tech')
    expect(reactPill).not.toHaveClass('skills-pills-pill--soft')
    expect(leadershipPill).not.toHaveClass('skills-pills-pill--tech')
    expect(leadershipPill).not.toHaveClass('skills-pills-pill--soft')
  })

  it('colors project skills when their project is built', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ 'project-4': 'built' }))
    renderExplorer()

    const reactPill = screen.getByText('React')
    const vitePill = screen.getByText('Vite')
    const leadershipPill = screen.getByText('Leadership')

    expect(reactPill).toHaveClass('skills-pills-pill--tech')
    expect(vitePill).toHaveClass('skills-pills-pill--tech')
    expect(leadershipPill).not.toHaveClass('skills-pills-pill--soft')
  })
})
