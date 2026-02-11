import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from '../App'

vi.mock('../routes/Welcome', () => ({
  default: () => <div>Welcome Route</div>,
}))

vi.mock('../routes/Resume', () => ({
  default: () => <div>Resume Route</div>,
}))

vi.mock('../routes/Explorer', () => ({
  default: () => <div>Explorer Route</div>,
}))

const renderAt = (path) => {
  window.history.pushState({}, '', path)
  return render(<App />)
}

describe('App routing', () => {
  it('renders the Welcome route at /', () => {
    renderAt('/')
    expect(screen.getByText('Welcome Route')).toBeInTheDocument()
  })

  it('renders the Resume route at /resume', () => {
    renderAt('/resume')
    expect(screen.getByText('Resume Route')).toBeInTheDocument()
  })

  it('renders the Explorer route at /explorer', () => {
    renderAt('/explorer')
    expect(screen.getByText('Explorer Route')).toBeInTheDocument()
  })
})
