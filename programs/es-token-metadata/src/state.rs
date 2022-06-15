use anchor_lang::prelude::*;
use shank::ShankAccount;

//[derive(AnchorSerialize, AnchorDeserialize, PartialEq, Debug, Clone, Id)]
#[account]
pub struct Metadata {
    pub mint: Pubkey,
    pub update_authority: Pubkey,
    pub data: Data,
    pub is_mutable: bool,
}

#[derive(AnchorSerialize, AnchorDeserialize, PartialEq, Debug, Clone)]
pub struct Data {
    /// The name of the asset
    pub name: String,
    /// The symbol for the asset
    pub symbol: String,
    /// URI pointing to JSON representing the asset
    pub uri: String,
    /// Royalty basis points that goes to creators in secondary sales (0-10000)
    pub seller_fee_basis_points: u16,
    /// Array of creators, optional
    pub creators: Option<Vec<Creator>>,
}

#[derive(AnchorSerialize, AnchorDeserialize, PartialEq, Debug, Clone)]
pub struct Creator {
    pub address: Pubkey,
    pub verified: bool,
    // In weight
    pub share: u64,
}
