import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import BuyTicket from '../frontend/src/components/BuyTicket.jsx';

describe('BuyTicket', () => {
    it('renders buy ticket form', () => {
        render(<BuyTicket />);
        expect(screen.getByText('Buy Tickets')).toBeInTheDocument();
    });

    it('shows error for invalid ticket number', () => {
        render(<BuyTicket />);
        fireEvent.change(screen.getByLabelText('Number of Tickets'), { target: { value: '0' } });
        fireEvent.click(screen.getByText('Buy Tickets'));
        expect(screen.getByText('Please enter a valid number of tickets.')).toBeInTheDocument();
    });
});