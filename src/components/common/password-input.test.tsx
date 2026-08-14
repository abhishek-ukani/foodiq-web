import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { PasswordInput } from './password-input'

describe('PasswordInput', () => {
  it('forwards id/aria props onto the actual <input>, not a wrapper element', () => {
    // Regression test: FormControl's Radix Slot merges props onto its
    // immediate child. An earlier version wrapped the input in a plain
    // <div>, which silently broke the label association (`aria-invalid`,
    // `id`, screen-reader linkage) since the props landed on the div instead.
    render(
      <div>
        <label htmlFor="pw">Password</label>
        <PasswordInput id="pw" aria-invalid="true" defaultValue="" onChange={() => {}} />
      </div>,
    )

    const input = screen.getByLabelText('Password')
    expect(input.tagName).toBe('INPUT')
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })

  it('masks the value by default and reveals it when the toggle is clicked', async () => {
    const user = userEvent.setup()
    render(<PasswordInput aria-label="Password" defaultValue="secret123" onChange={() => {}} />)

    const input = screen.getByLabelText('Password')
    expect(input).toHaveAttribute('type', 'password')

    await user.click(screen.getByRole('button', { name: /show password/i }))
    expect(input).toHaveAttribute('type', 'text')

    await user.click(screen.getByRole('button', { name: /hide password/i }))
    expect(input).toHaveAttribute('type', 'password')
  })
})
