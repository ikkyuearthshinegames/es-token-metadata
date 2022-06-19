

use anchor_lang::{
    prelude::*,
    solana_program::{program::invoke, system_instruction},
    AnchorDeserialize, system_program,
};

use anchor_spl::token::{Mint, Token, TokenAccount};
use crate::state::*;
use crate::constants::*;
use crate::errors::*;
#[derive(Accounts)]
#[instruction(
    buyer_price: u64,
    token_size: u64,
    escrow_payment_bump : u8
)]
pub struct Bid<'info> {
    /// User wallet account
    #[account(mut)]
    pub wallet: Signer<'info>,

    /// CHECK: Validated in big_logic
    /// User SOL or SPL account to transfer funds from.
    #[account(mut)]
    pub payment_account: UncheckedAccount<'info>,

    /// Auction House instance treasurt mint account
    pub treasury_mint: Account<'info, Mint>,

    /// SPL token account.
    pub token_account: Box<Account<'info, TokenAccount>>,

    /// CHECK: validate via seeds
    /// Custom es-metadata account
    pub metadata_account: UncheckedAccount<'info>,

    /// CHECK: Validated in bid_logic
    /// Auction House instance authority account.
    pub authority: UncheckedAccount<'info>,

    /// CHECK: Not dangerous. Account seeds checked in constraint.
    /// Buyer escrow payment account PDA.
    #[account(
        init, 
        seeds = [
            PREFIX.as_bytes(), 
            cookie_cutter.key().as_ref(), 
            wallet.key().as_ref()
            ], 
        bump,
        payer = wallet,
        space = ESCROW_PAYMENT_ACCOUNT_SIZE
    )]
    pub escrow_payment_account: UncheckedAccount<'info>,

    /// CHECK: Not dangerous. Account seeds checked in constraint.
    /// Buyer trade state PDA.
    #[account(
        init, 
        seeds = [
            PREFIX.as_bytes(),
            wallet.key().as_ref(),
            cookie_cutter.key().as_ref(),
            token_account.key().as_ref(),
            treasury_mint.key().as_ref(),
            token_account.mint.as_ref(),
            buyer_price.to_le_bytes().as_ref(),
            token_size.to_le_bytes().as_ref()
        ],
        bump,
        payer = wallet,
        space = TRADE_STATE_SIZE
    )]
    buyer_trade_state:  Account<'info, BuyerTradeState>,

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

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn bid<'info> (
    ctx: Context<'_, '_, '_, 'info, Bid<'info>>,
    buyer_price: u64,
    token_size: u64,
    escrow_payment_bump : u8
) -> Result<()> {
    // TODO: add assertions


    bid_logic(ctx, buyer_price, token_size, escrow_payment_bump)
}

pub fn bid_logic <'info> (
    ctx: Context<'_, '_, '_, 'info, Bid<'info>>,
    buyer_price: u64,
    token_size: u64,
    escrow_payment_bump : u8
) -> Result<()> {
    //NOTE:  extract variables from ctx
    let wallet = &ctx.accounts.wallet;
    let token_account = & ctx.accounts.token_account;
    let cookie_cutter = &mut ctx.accounts.cookie_cutter;
    let escrow_payment_account = & ctx.accounts.escrow_payment_account;
    let buyer_trade_state = &mut ctx.accounts.buyer_trade_state;
    let treasury_mint = &ctx.accounts.treasury_mint;
    let rent = &ctx.accounts.rent;
    let payment_account = &ctx.accounts.payment_account;
    let system_program = &ctx.accounts.system_program;

    // NOTE: populate buyer_trade_state
    buyer_trade_state.bidder = wallet.key();
    buyer_trade_state.bid_price = buyer_price;
    buyer_trade_state.ata = token_account.key();


    // NOTE: add escrow_payment_account_bump to cookie_cutter
    cookie_cutter.escrow_payment_bump = escrow_payment_bump;

    // NOTE:  check for duble bidding and transfer lamports to escrow account
    let is_native = treasury_mint.key() == spl_token::native_mint::id();

    if is_native {
        let total_lamport_required = buyer_price.checked_add(rent.minimum_balance((escrow_payment_account.data_len()))).ok_or(CookieCutterError::NumericalOverflow)?;

        if escrow_payment_account.lamports() < total_lamport_required {
            let diff = buyer_price
                .checked_add(rent.minimum_balance(escrow_payment_account.data_len()))
                .ok_or(CookieCutterError::NumericalOverflow)?
                .checked_sub(escrow_payment_account.lamports())
                .ok_or(CookieCutterError::NumericalOverflow)?;

            invoke(
                &system_instruction::transfer(
                    payment_account.key, 
                    escrow_payment_account.key, 
                    diff
                ), 
                &[
                    payment_account.to_account_info(),
                    escrow_payment_account.to_account_info(),
                    system_program.to_account_info()
                ]
            )?;
        }
    }

    // TODO: add SPL_TOKEN suppport


    Ok(())
}