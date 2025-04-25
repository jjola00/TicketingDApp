import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CheckBalance from '../frontend/src/components/CheckBalance.jsx';

describe('CheckBalance', () => {
    it('renders check balance form', () => {
        render(<CheckBalance />);
        expect(screen.getByText('Check Balance')).toBeInTheDocument();
    });

    it('shows error for invalid address', () => {
        render(<CheckBalance />);
        fireEvent.change(screen.getByPlaceholderText('Enter wallet address'), { target: { value: 'invalid' } });
        fireEvent.click(screen.getByText('Check Balance'));
        expect(screen.getByText('Please enter a valid wallet address.')).toBeInTheDocument();
    });
});