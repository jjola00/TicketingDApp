// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/// @title TicketToken - An ERC-20 token for event ticketing
/// @notice This contract allows users to buy and transfer tickets as tokens on the Sepolia Testnet
contract TicketToken is ERC20, AccessControl, Pausable {
    bytes32 public constant VENUE_ROLE = keccak256("VENUE_ROLE");
    uint256 public constant TICKET_PRICE = 0.01 ether; // Price per ticket in ETH
    address public immutable venue; // Venue address for ticket transfers

    // Mapping to track ticket expiration (timestamp when ticket expires)
    mapping(address => mapping(uint256 => uint256)) public ticketExpirations;
    uint256 public ticketDuration = 30 days; // Tickets expire after 30 days
    uint256 public nextTicketId = 1; // Incremental ticket ID

    event TicketPurchased(address indexed buyer, uint256 ticketId, uint256 amount);
    event TicketTransferred(address indexed from, address indexed to, uint256 ticketId, uint256 amount);
    event TicketExpired(address indexed owner, uint256 ticketId);

    /// @notice Initializes the contract, sets the deployer as admin, and records the venue address
    /// @param _venue The address of the venue (vendor) for ticket transfers
    constructor(address _venue) ERC20("TicketToken", "TKT") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(VENUE_ROLE, _venue);
        venue = _venue;
    }

    /// @notice Grants the VENUE_ROLE to an address
    /// @param venueAddress The address to grant the role to
    function grantVenueRole(address venueAddress) public onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(VENUE_ROLE, venueAddress);
    }

    /// @notice Mints new tokens (tickets) to an address, restricted to venues
    /// @param to The address to mint tokens to
    /// @param amount The amount of tokens to mint (in wei)
    function mint(address to, uint256 amount) public onlyRole(VENUE_ROLE) whenNotPaused {
        _mint(to, amount);
    }

    /// @notice Allows any user to buy tickets by sending ETH
    /// @param numberOfTickets The number of tickets to buy
    /// @return ticketId The ID of the purchased ticket
    function buyTickets(uint256 numberOfTickets) public payable whenNotPaused returns (uint256) {
        uint256 totalCost = numberOfTickets * TICKET_PRICE;
        require(msg.value >= totalCost, "Insufficient ETH: Need more ETH to buy tickets");

        // Mint tickets (1 ticket = 1 TKT token)
        uint256 amount = numberOfTickets * 10**18;
        _mint(msg.sender, amount);

        // Record ticket expiration
        uint256 ticketId = nextTicketId++;
        ticketExpirations[msg.sender][ticketId] = block.timestamp + ticketDuration;

        // Refund excess ETH
        if (msg.value > totalCost) {
            payable(msg.sender).transfer(msg.value - totalCost);
        }

        emit TicketPurchased(msg.sender, ticketId, numberOfTickets);
        return ticketId;
    }

    /// @notice Transfers tickets to another address
    /// @param to The recipient address
    /// @param amount The amount of tickets to transfer (in wei)
    /// @param ticketId The ID of the ticket being transferred
    function transferTickets(address to, uint256 amount, uint256 ticketId) public whenNotPaused {
        require(block.timestamp < ticketExpirations[msg.sender][ticketId], "Ticket has expired");
        _transfer(msg.sender, to, amount);
        ticketExpirations[to][ticketId] = ticketExpirations[msg.sender][ticketId];
        delete ticketExpirations[msg.sender][ticketId];
        emit TicketTransferred(msg.sender, to, ticketId, amount / 10**18);
    }

    /// @notice Transfers tickets back to the venue (vendor)
    /// @param amount The amount of tickets to transfer (in wei)
    /// @param ticketId The ID of the ticket being transferred
    function transferToVendor(uint256 amount, uint256 ticketId) public whenNotPaused {
        transferTickets(venue, amount, ticketId);
    }

    /// @notice Checks the balance of an account
    /// @param account The address to check
    /// @return The balance in wei
    function checkBalance(address account) public view returns (uint256) {
        return balanceOf(account);
    }

    /// @notice Gets the total supply of tokens
    /// @return The total supply in wei
    function getTotalSupply() public view returns (uint256) {
        return totalSupply();
    }

    /// @notice Pauses the contract, preventing certain actions
    function pause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /// @notice Unpauses the contract
    function unpause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    /// @notice Allows the venue to withdraw accumulated ETH
    function withdraw() public onlyRole(VENUE_ROLE) {
        payable(venue).transfer(address(this).balance);
    }

    /// @notice Allows users to burn expired tickets
    /// @param ticketId The ID of the ticket to burn
    function burnExpiredTicket(uint256 ticketId) public {
        require(block.timestamp >= ticketExpirations[msg.sender][ticketId], "Ticket not expired");
        uint256 amount = balanceOf(msg.sender);
        require(amount > 0, "No tickets to burn");
        _burn(msg.sender, amount);
        delete ticketExpirations[msg.sender][ticketId];
        emit TicketExpired(msg.sender, ticketId);
    }

    // Allow the contract to receive ETH
    receive() external payable {}
}