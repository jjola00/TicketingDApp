import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CreateWallet from '../frontend/src/components/CreateWallet.jsx';

describe('CreateWallet', () => {
    it('renders create wallet form', () => {
        render(<CreateWallet />);
        expect(screen.getByText('Create a Wallet')).toBeInTheDocument();
    });

    it('shows error if password is empty', () => {
        render(<CreateWallet />);
        fireEvent.click(screen.getByText('Create Wallet'));
        expect(screen.getByText('Please enter a password for the keystore.')).toBeInTheDocument();
    });
});