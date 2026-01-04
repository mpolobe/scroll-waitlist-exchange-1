module africoin::afc {
    use sui::coin;
    use sui::transfer;
    use sui::url;
    use std::option;
    use sui::tx_context::{Self, TxContext};

    /// The type identifier of Africoin currency
    struct AFC has drop {}

    /// Module initializer is called once on module publish.
    /// A treasury cap is sent to the publisher, who then controls minting and burning
    fun init(witness: AFC, ctx: &mut TxContext) {
        let (treasury, metadata) = coin::create_currency(
            witness, 
            9, 
            b"AFC", 
            b"Africoin", 
            b"The Digital Currency of Africa Railways", 
            option::some(url::new_unsafe_from_bytes(b"https://africarailways.com/logo.png")), 
            ctx
        );
        transfer::public_freeze_object(metadata);
        transfer::public_transfer(treasury, tx_context::sender(ctx));
    }
}
