module africoin::bridge {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Balance};
    use sui::event;
    use sui::tx_context::{Self, TxContext};
    
    // Import the AFC token type from the same package
    use africoin::afc::AFC;

    /// Shared object to hold the locked coins
    struct BridgeVault has key {
        id: UID,
        coins: Balance<AFC>
    }

    /// Event emitted when coins are locked
    /// The Relayer listens for this event to trigger minting on Ethereum
    struct AFCLockedEvent has copy, drop {
        user: address,
        amount: u64,
        eth_destination: vector<u8> // Ethereum address (e.g. "0x123...")
    }

    /// Initialize the bridge vault
    fun init(ctx: &mut TxContext) {
        let vault = BridgeVault {
            id: object::new(ctx),
            coins: balance::zero()
        };
        // Share the vault so anyone can deposit
        transfer::share_object(vault);
    }

    /// Lock AFC coins to be bridged to Ethereum
    /// 
    /// # Arguments
    /// * `vault` - The shared BridgeVault object
    /// * `payment` - The AFC coins to lock
    /// * `eth_address` - The destination address on Ethereum (as bytes)
    public entry fun lock_afc(
        vault: &mut BridgeVault, 
        payment: Coin<AFC>, 
        eth_address: vector<u8>,
        ctx: &mut TxContext
    ) {
        let amount = coin::value(&payment);
        let sender = tx_context::sender(ctx);

        // Add coins to the vault
        let balance = coin::into_balance(payment);
        balance::join(&mut vault.coins, balance);

        // Emit the event for the Relayer to pick up
        event::emit(AFCLockedEvent {
            user: sender,
            amount: amount,
            eth_destination: eth_address
        });
    }
}
