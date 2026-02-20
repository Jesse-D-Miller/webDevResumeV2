import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const renderExplorerWithData = async (mockedData) => {
  vi.resetModules()
  vi.doMock('../data/resume.json', () => ({ default: mockedData }))

  const { default: Explorer } = await import('../routes/Explorer')
  const { XPProvider } = await import('../contexts/XPContext')

  return render(
    <XPProvider>
      <MemoryRouter>
        <Explorer />
      </MemoryRouter>
    </XPProvider>
  )
}

describe('SkillsPills Lighthouse unlock', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('activates hidden project skills when Lighthouse Labs is built', async () => {
    const actualData = await vi.importActual('../data/resume.json')
    const lighthouseId = actualData.education.find(
      (edu) => edu.school === 'Lighthouse Labs'
    )?.id

    const hiddenProject = {
      id: 'project-0',
      title: 'Hidden Project',
      subtitle: 'Not in top six',
      period: '2023',
      stack: ['Elixir'],
      links: { live: '', code: '', video: '' },
      highlights: ['Hidden project highlight'],
      skills: ['Elixir'],
      skillsDetailed: [{ name: 'Elixir', category: 'Languages' }],
      status: 'Complete',
    }

    const mockedData = {
      ...actualData,
      skills: [...actualData.skills, { name: 'Elixir', category: 'Languages' }],
      projects: [...actualData.projects, hiddenProject],
    }

    localStorage.setItem(
      'project-build-states',
      JSON.stringify({ [lighthouseId]: 'built' })
    )

    await renderExplorerWithData(mockedData)

    const elixirPill = await screen.findByText('Elixir')
    expect(elixirPill).toHaveClass('skills-pills-pill--active')
    expect(elixirPill).toHaveClass('skills-pills-pill--tech')
  })
})
