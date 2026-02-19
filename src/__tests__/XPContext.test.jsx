import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { XPProvider } from '../contexts/XPContext'
import { useXP } from '../hooks/useXP'

function XPConsumer() {
  const { xp, completedXpPoints, heroMessage, grantXp, hasClicked } = useXP()

  return (
    <div>
      <div data-testid="xp">{xp}</div>
      <div data-testid="completed">{completedXpPoints}</div>
      <div data-testid="message">{heroMessage}</div>
      <div data-testid="clicked">
        {hasClicked('stats-enhance-api') ? 'yes' : 'no'}
      </div>
      <button onClick={() => grantXp('stats-enhance-api', 28, 'Nice')}>Grant</button>
    </div>
  )
}

describe('XPContext', () => {
  it('throws when useXP is used outside provider', () => {
    expect(() => render(<XPConsumer />)).toThrow(
      'useXP must be used within XPProvider'
    )
  })

  it('grants XP once and tracks hero message', () => {
    render(
      <XPProvider>
        <XPConsumer />
      </XPProvider>
    )

    const grantButton = screen.getByRole('button', { name: 'Grant' })

    fireEvent.click(grantButton)
    expect(screen.getByTestId('xp')).toHaveTextContent('28')
    expect(screen.getByTestId('clicked')).toHaveTextContent('yes')
    expect(screen.getByTestId('message')).toHaveTextContent('Nice')
    expect(screen.getByTestId('completed')).not.toHaveTextContent('0')

    fireEvent.click(grantButton)
    expect(screen.getByTestId('xp')).toHaveTextContent('28')
  })
})