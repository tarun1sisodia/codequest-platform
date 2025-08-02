import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Badge from './Badge';

describe('Badge Component', () => {
  it('renders correctly with children', () => {
    render(<Badge>Test Badge</Badge>);
    expect(screen.getByText('Test Badge')).toBeInTheDocument();
  });

  it('applies the correct variant class', () => {
    render(<Badge variant="success">Success Badge</Badge>);
    const badge = screen.getByText('Success Badge');
    expect(badge).toHaveClass('bg-gradient-to-r', 'from-green-600', 'to-green-400', 'text-white');
  });

  it('applies the warning variant class', () => {
    render(<Badge variant="warning">Warning Badge</Badge>);
    const badge = screen.getByText('Warning Badge');
    expect(badge).toHaveClass('bg-gradient-to-r', 'from-yellow-600', 'to-yellow-400', 'text-white');
  });

  it('applies the danger variant class', () => {
    render(<Badge variant="danger">Danger Badge</Badge>);
    const badge = screen.getByText('Danger Badge');
    expect(badge).toHaveClass('bg-gradient-to-r', 'from-red-600', 'to-red-400', 'text-white');
  });

  it('applies the info variant class', () => {
    render(<Badge variant="info">Info Badge</Badge>);
    const badge = screen.getByText('Info Badge');
    expect(badge).toHaveClass('bg-gradient-to-r', 'from-blue-600', 'to-blue-400', 'text-white');
  });

  it('applies the achievement variant class', () => {
    render(<Badge variant="achievement">Achievement Badge</Badge>);
    const badge = screen.getByText('Achievement Badge');
    expect(badge).toHaveClass('bg-gradient-to-r', 'from-purple-600', 'to-pink-600', 'text-white');
  });
});
