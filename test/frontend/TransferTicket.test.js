import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TransferTicket from '../frontend/src/components/TransferTicket.jsx';

describe('TransferTicket', () => {
    it('renders transfer ticket form', () => {
        render(<TransferTicket />);
        expect(screen.getByText('Transfer Tickets')).toBeInTheDocument();
    });

    it('shows error if recipient address is empty', () => {
        render(<TransferTicket />);
        fireEvent.change(screen.getByLabelText('Number of Tickets'), { target: { value: '1' } });
        fireEvent.change(screen.getByLabelText('Ticket ID'), { target: { value: '1' } });
        fireEvent.click(screen.getByText('Transfer Tickets'));
        expect(screen.getByText('Please enter a recipient address or select Transfer to Vendor.')).toBeInTheDocument();
    });
});