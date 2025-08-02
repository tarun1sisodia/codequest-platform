import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ErrorHandler from './ErrorHandler';

const renderWithRouter = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {ui}
    </BrowserRouter>
  );
};

describe('ErrorHandler Component', () => {
  it('renders nothing when error is null', () => {
    const { container } = renderWithRouter(<ErrorHandler error={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders error message when string is provided', () => {
    renderWithRouter(<ErrorHandler error="Something went wrong" />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders error message from APIError object', () => {
    const apiError = {
      error: 'API Error',
      message: 'Failed to fetch data',
      code: '500',
      details: 'Server error'
    };
    
    renderWithRouter(<ErrorHandler error={apiError} />);
    expect(screen.getByText('Failed to fetch data')).toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', () => {
    const handleRetry = vi.fn();
    renderWithRouter(
      <ErrorHandler 
        error="Something went wrong" 
        onRetry={handleRetry} 
      />
    );
    
    const retryButton = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(retryButton);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when close button is clicked', async () => {
    vi.useFakeTimers();
    const handleClose = vi.fn();
    renderWithRouter(
      <ErrorHandler 
        error="Something went wrong" 
        onClose={handleClose} 
      />
    );
    
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    
    // Fast-forward the timeout (300ms as per component)
    vi.advanceTimersByTime(300);
    
    expect(handleClose).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});
