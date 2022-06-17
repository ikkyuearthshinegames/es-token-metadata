
use anchor_lang::{prelude::*, AnchorDeserialize, AnchorSerialize};

#[account]
pub struct GayDungeon {
    pub gay_dungeon_fee_account: Pubkey,
    pub gay_dungeon_treasury: Pubkey,
    pub treasury_withdrawal_destination: Pubkey,
    pub fee_withdrawal_destination: Pubkey,
    pub treasury_mint: Pubkey,
    pub authority: Pubkey,
    pub creator: Pubkey,
    pub bump: u8,
    pub treasury_bump: u8,
    pub fee_payer_bump: u8,
    pub seller_fee_basis_points: u16,
    pub requires_sign_off: bool,
    pub can_change_sale_price: bool,
    pub escrow_payment_bump: u8,
}

#[repr(C)]
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Debug)]
pub struct CreateGayDungeonArgs {
    pub gay_dungeon_bump: u8,
    pub gay_dungeon_treasury_bump: u8,
    pub gay_dungeon_fee_payer_bump: u8,
    pub seller_fee_basis_points: u16,
    pub requires_sign_off: bool,
    pub can_change_sale_price: bool,
}


#[account]
pub struct SellerTradeState {
    
}

#[repr(C)]
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Debug)]
pub struct SellArgs {

}