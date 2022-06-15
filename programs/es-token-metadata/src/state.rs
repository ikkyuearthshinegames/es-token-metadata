use crate::constant::*;
use anchor_lang::prelude::*;
use anchor_spl::token::Token;

#[derive(Accounts)]
pub struct MintNft<'info> {
    #[account(mut)]
    pub mint_authority: Signer<'info>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub mint: UncheckedAccount<'info>,
    // #[account(mut)]
    pub token_program: Program<'info, Token>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub token_account: UncheckedAccount<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub payer: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub rent: AccountInfo<'info>,
}

#[derive(AnchorSerialize, AnchorDeserialize, PartialEq, Debug, Clone)]
pub struct MintNFTArgs {
    pub creator_key: Pubkey,
    pub uri: String,
    pub title: String,
}

#[derive(Accounts)]
pub struct CreateMetadata<'info> {
    /// CHECK:
    #[account(
        init,
        seeds = [
            METADATA_SEED_KEY.as_bytes(),
            crate::id().as_ref(),
            mint.key().as_ref()
        ],
        bump,
        space = 8 + METADATA_SIZE,
        payer = payer
    )]
    pub metadata: Account<'info, Metadata>,
    /// CHECK:
    #[account(mut)]
    pub payer: Signer<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub mint: UncheckedAccount<'info>,
    pub mint_authority: Signer<'info>,
    pub update_authority: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(AnchorSerialize, AnchorDeserialize, PartialEq, Debug, Clone)]
pub struct CreateMetadataArgs {
    pub data: Data,
    pub allow_direct_creator_writes: bool,
    pub is_mutable: bool,
}

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
