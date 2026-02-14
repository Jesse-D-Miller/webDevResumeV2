import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, beforeEach } from 'vitest'
import Explorer from '../routes/Explorer'
import { XPProvider } from '../contexts/XPContext'
import SkillsPills from '../components/SkillsPills'

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

  it('adds experience skills and activates them when built', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ 'experience-1': 'built' })
    )

    renderExplorer()

    const skill = await screen.findByText('Strategic Thinking')
    expect(skill).toBeInTheDocument()

    const skillPill = skill.closest('.skills-pills-pill')
    expect(skillPill).toHaveClass('skills-pills-pill--active')
  })

  it('activates education skills when built', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ 'education-1': 'built' })
    )

    renderExplorer()

    const gitPill = screen.getByText('Git')
    expect(gitPill).toHaveClass('skills-pills-pill--tech')
  })

  it('uses GitHub highlight styling when a top language is provided', () => {
    render(
      <SkillsPills
        activeSkills={new Set(['React'])}
        highlightedSkills={new Set(['React'])}
      />
    )

    const reactPill = screen.getByText('React')
    expect(reactPill).toHaveClass('skills-pills-pill--github')
    expect(reactPill).not.toHaveClass('skills-pills-pill--tech')
  })
})
