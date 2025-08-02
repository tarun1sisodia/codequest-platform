import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ChallengeCard from '../challenges/ChallengeCard';

// Mock react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual('react-router-dom');
	return {
		...actual,
		useNavigate: () => mockNavigate,
	};
});

const mockChallenge = {
	_id: '1',
	title: 'Hello World',
	slug: 'hello-world',
	description: 'Create a function that returns "Hello, World!"',
	difficulty: 'easy' as const,
	language: 'typescript',
	template: 'function hello(): string {\n  // Your code here\n}',
	testCases: [
		{
			input: [],
			expected: 'Hello, World!',
			description: 'Should return Hello, World!'
		}
	],
	timeLimit: 5000,
	memoryLimit: 128,
	conceptTags: ['variables', 'functions'],
	functionName: 'hello',
	createdAt: '2024-01-01T00:00:00.000Z',
	updatedAt: '2024-01-01T00:00:00.000Z',
};


const renderWithRouter = (ui: React.ReactElement) => {
	return render(
		<BrowserRouter>
			{ui}
		</BrowserRouter>
	);
};

describe('ChallengeCard', () => {
	beforeEach(() => {
		mockNavigate.mockClear();
	});

	it('renders challenge information correctly', () => {
		renderWithRouter(<ChallengeCard challenge={mockChallenge} />);

		expect(screen.getByText('Hello World')).toBeInTheDocument();
		expect(screen.getByText(/Create a function that returns/)).toBeInTheDocument();
		expect(screen.getByText('easy')).toBeInTheDocument();
		expect(screen.getByText('typescript')).toBeInTheDocument();
	});

	it('displays difficulty with correct styling', () => {
		renderWithRouter(<ChallengeCard challenge={mockChallenge} />);

		const difficultyBadge = screen.getByText('easy');
		expect(difficultyBadge).toHaveClass('bg-gradient-to-r', 'from-green-600', 'to-green-400');
	});

	it('displays medium difficulty with correct styling', () => {
		const mediumChallenge = { ...mockChallenge, difficulty: 'medium' as const };
		renderWithRouter(<ChallengeCard challenge={mediumChallenge} />);

		const difficultyBadge = screen.getByText('medium');
		expect(difficultyBadge).toHaveClass('bg-gradient-to-r', 'from-yellow-600', 'to-yellow-400');
	});

	it('displays hard difficulty with correct styling', () => {
		const hardChallenge = { ...mockChallenge, difficulty: 'hard' as const };
		renderWithRouter(<ChallengeCard challenge={hardChallenge} />);

		const difficultyBadge = screen.getByText('hard');
		expect(difficultyBadge).toHaveClass('bg-gradient-to-r', 'from-red-600', 'to-red-400');
	});

	it('displays test cases count', () => {
		renderWithRouter(<ChallengeCard challenge={mockChallenge} />);

		expect(screen.getByText('1 test cases')).toBeInTheDocument();
	});

	it('renders as a link to challenge detail page', () => {
		renderWithRouter(<ChallengeCard challenge={mockChallenge} />);

		const link = screen.getByRole('link');
		expect(link).toHaveAttribute('href', '/challenge/hello-world');
	});

	it('handles different language types', () => {
		const goChallenge = { ...mockChallenge, language: 'go' as const };
		renderWithRouter(<ChallengeCard challenge={goChallenge} />);

		expect(screen.getByText('go')).toBeInTheDocument();
	});

	it('displays challenge title and description', () => {
		renderWithRouter(<ChallengeCard challenge={mockChallenge} />);

		expect(screen.getByText('Hello World')).toBeInTheDocument();
		expect(screen.getByText(/Create a function that returns/)).toBeInTheDocument();
	});

	it('displays long descriptions', () => {
		const longDescription = 'A very long description that should be displayed';
		const challengeWithLongDesc = { ...mockChallenge, description: longDescription };
		renderWithRouter(<ChallengeCard challenge={challengeWithLongDesc} />);

		expect(screen.getByText(longDescription)).toBeInTheDocument();
	});

	it('renders as accessible link', () => {
		renderWithRouter(<ChallengeCard challenge={mockChallenge} />);

		const link = screen.getByRole('link');
		expect(link).toBeInTheDocument();
		expect(link).toHaveAttribute('href', '/challenge/hello-world');
	});

	it('renders without crashing when challenge data is minimal', () => {
		const minimalChallenge = {
			_id: '1',
			title: 'Test',
			slug: 'test',
			description: 'Test description',
			difficulty: 'easy' as const,
			language: 'typescript' as const,
			template: 'function test() {}',
			testCases: [],
			timeLimit: 5000,
			memoryLimit: 128,
			conceptTags: [],
			functionName: 'test',
			createdAt: '2024-01-01T00:00:00.000Z',
			updatedAt: '2024-01-01T00:00:00.000Z',
		};

		expect(() => {
			renderWithRouter(<ChallengeCard challenge={minimalChallenge} />);
		}).not.toThrow();

		expect(screen.getByText('Test')).toBeInTheDocument();
	});

	it('displays hover effects correctly', () => {
		renderWithRouter(<ChallengeCard challenge={mockChallenge} />);

		const link = screen.getByRole('link');
		expect(link).toHaveClass('hover:shadow-md', 'transition-shadow');
	});

	it('handles edge case with empty description gracefully', () => {
		const challengeWithEmptyDesc = {
			...mockChallenge,
			description: '',
		};

		expect(() => {
			renderWithRouter(<ChallengeCard challenge={challengeWithEmptyDesc} />);
		}).not.toThrow();

		expect(screen.getByText('Hello World')).toBeInTheDocument();
	});
});
