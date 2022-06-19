use anchor_lang::{
    prelude::*,
    solana_program::{program::invoke, system_instruction},
    AnchorDeserialize,
};

use anchor_spl::token::{Mint, Token, TokenAccount, };
use anchor_spl::associated_token::*;
use crate::state::*;
use crate::constants::*;

#[derive(Accounts)]
#[instruction(
    program_as_signer_bump: u8,
    buyer_price: u64,
    token_size: u64,
)]
pub struct ExecuteSale <'info> {
    /// CHECK: Validated in execute_sale_logic.
    /// Buyer's wallet account
    #[account(mut)]
    pub buyer: UncheckedAccount<'info>,

    /// CHECK: Validated in execute_sale_logic.
    /// Seller's wallet account
    #[account(mut)]
    pub seller: UncheckedAccount<'info>,

    /// CHECK : Validated in execute_sale_logic.
    /// Token account where the SPL token is being held
    #[account(mut)]
    pub token_account: Box<Account<'info, TokenAccount>>,


    /// CHECK: Validated in execute_sale_logic.
    /// Token mint account for the SPL token.
    pub token_mint: UncheckedAccount<'info>,

    /// CHECK: Validated in execute_sale_logic.
    /// Metaplex metaplex account holding extra infos.
    pub metadata_account: UncheckedAccount<'info>,

     /// CHECK: Not dangerous. validate via seeds check.
    /// Buyer escrow payment account.
    #[account (
        mut,
        seeds = [
            PREFIX.as_bytes(),
            cookie_cutter.key().as_ref(),
            buyer.key().as_ref()
        ],
        bump = cookie_cutter.escrow_payment_bump
    )]
    pub escrow_payment_account: UncheckedAccount<'info>,

    /// CHECK: Validated in execute_sale_logic.
    /// Seller SOL or SPL account to receive payment at,
    #[account(mut)]
    pub seller_payment_receipt_account: UncheckedAccount<'info>,

    /// CHECK: Validated in execute_sale_logic.
    /// Buyer SOL or SPL account to receive the purchased item at.
    #[account(mut)]
    pub buyer_receipt_token_account: UncheckedAccount<'info>,

    /// CHECK: Validated in execute_sale_logic.
    /// Auction House instance authority
    pub authority: UncheckedAccount<'info>,

    /// Auction House instance PDA account.
    /// PDA was seeded from PREFIX + Auction house's creator + Auction house's treasury mint
    #[account(
        mut,
        seeds = [
            PREFIX.as_bytes(), 
            cookie_cutter.creator.as_ref(), 
            cookie_cutter.treasury_mint.as_ref()
        ], 
        bump = cookie_cutter.bump,
        has_one = authority, 
        has_one = cookie_cutter_fee_account
    )]
    pub cookie_cutter: Box<Account<'info, CookieCutter>>,

     /// CHECK: validate via seeds
     #[account(
        mut,
        seeds = [
            PREFIX.as_bytes(),
            cookie_cutter.key().as_ref(),
            FEE_PAYER.as_bytes()
        ],
        bump = cookie_cutter.fee_payer_bump
    )]
    pub cookie_cutter_fee_account :  UncheckedAccount<'info>,

    /// CHECK: validate via seeds
    #[account(
        mut,
        seeds = [
            PREFIX.as_bytes(),
            cookie_cutter.key().as_ref(),
            TREASURY.as_bytes()
        ],
        bump = cookie_cutter.treasury_bump
    )]
    pub cookie_cutter_treasury: UncheckedAccount<'info>,


     /// CHECK: Not dangerous. Validate in execute_sale_logic.
    /// Buyer trade state PDA account encoding the buy order.
    #[account(
        mut, 
        seeds = [
            PREFIX.as_bytes(),
            buyer.key().as_ref(),
            cookie_cutter.key().as_ref(),
            token_account.key().as_ref(),
            cookie_cutter.treasury_mint.key().as_ref(),
            token_account.mint.as_ref(),
            buyer_price.to_le_bytes().as_ref(),
            token_size.to_le_bytes().as_ref()
        ],
        bump,
    )]
    buyer_trade_state:  Account<'info, BuyerTradeState>,

    /// CHECK: Not dangerous. Validate via seeds check.
    /// Seller trade state PDA account encoding the sell order.
    #[account(
        mut,
        seeds = [
            PREFIX.as_bytes(),
            seller.key().as_ref(),
            cookie_cutter.key().as_ref(),
            token_account.key().as_ref(),
            cookie_cutter.treasury_mint.as_ref(),
            token_account.mint.as_ref(),
            &buyer_price.to_le_bytes(),
            &token_size.to_le_bytes()
        ],
        bump
    )]
    pub seller_trade_state: Account<'info, SellerTradeState>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub ata_program: Program<'info, AssociatedToken>,

    /// CHECK: Not dangerous. Validate via seeds check.
    #[account(
        seeds = [
            PREFIX.as_bytes(),
            SIGNER.as_bytes()
        ],
        bump = program_as_signer_bump
    )]
    pub program_as_signer: UncheckedAccount<'info>,

    pub rent: Sysvar<'info, Rent>,
}


pub fn execute_sale<'info>(
    ctx: Context<'_, '_, '_, 'info, ExecuteSale<'info>>,
    escrow_payment_bump: u8,
    free_trade_state_bump: u8,
    program_as_signer_bump: u8,
    buyer_price: u64,
    token_size: u64,
) -> Result<()> {

    // TODO: add assertions

    execute_sale_logic(
        ctx,
        escrow_payment_bump,
        free_trade_state_bump,
        program_as_signer_bump,
        buyer_price,
        token_size,
    )
}

pub fn execute_sale_logic<'info>(
    ctx: Context<'_, '_, '_, 'info, ExecuteSale<'info>>,
    escrow_payment_bump: u8,
    free_trade_state_bump: u8,
    program_as_signer_bump: u8,
    buyer_price: u64,
    token_size: u64,

) -> Result<()> {
    Ok(())
}
