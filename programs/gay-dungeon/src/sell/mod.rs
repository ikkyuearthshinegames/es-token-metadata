
use anchor_lang::prelude::*;
use solana_program::program::invoke;
use spl_token::instruction::approve;
use anchor_spl::token::{Token, TokenAccount};
use es_token_metadata::constants::*;

use crate::constants::*;
use crate::state::*;


#[derive(Accounts)]
#[instruction(
    metadata_bump : u8,
    program_as_signer_bump : u8,
    buyer_price : u8,
    token_size : u8
)]
pub struct Sell <'info> {
    /// CHECK: Validated in sell_logic.
    /// User wallet account 
    #[account(mut)]
    pub wallet: UncheckedAccount<'info>,

    /// SPL token account containing token for sale
    #[account(mut)]
    pub token_account: Box<Account<'info, TokenAccount>>,

    /// CHECK: validate via seeds
    /// Custom es-metadata account
    #[account(
        mut,
        seeds = [
            METADATA_SEED_KEY.as_bytes(),
            es_token_metadata::id().as_ref(),
            token_account.mint.as_ref(),
        ],
        bump = metadata_bump
    )]
    pub metadata_account: UncheckedAccount<'info>,

    /// CHECK: Validated as a signer in sell_logic.
    /// authority account.
    pub authority: UncheckedAccount<'info>,

    /// Auction House instance PDA account.
    /// PDA was seeded from PREFIX + Auction house's creator + Auction house's treasury mint
    #[account(
        seeds = [
            PREFIX.as_bytes(), 
            gay_dungeon.creator.as_ref(), 
            gay_dungeon.treasury_mint.as_ref()
        ], 
        bump = gay_dungeon.bump,
        has_one = authority, 
        has_one = gay_dungeon_fee_account
    )]
    pub gay_dungeon: Box<Account<'info, GayDungeon>>,

    /// CHECK: validate via seeds
    #[account(
        mut,
        seeds = [
            PREFIX.as_bytes(),
            gay_dungeon.key().as_ref(),
            FEE_PAYER.as_bytes()
        ],
        bump = gay_dungeon.fee_payer_bump
    )]
    pub gay_dungeon_fee_account :  UncheckedAccount<'info>,

    #[account(
        init,
        seeds = [
            PREFIX.as_bytes(),
            wallet.key().as_ref(),
            gay_dungeon.key().as_ref(),
            token_account.key().as_ref(),
            gay_dungeon.treasury_mint.as_ref(),
            token_account.mint.as_ref(),
            &buyer_price.to_le_bytes(),
            &token_size.to_le_bytes()
        ],
        space = TRADE_STATE_SIZE,
        payer = wallet,
        bump
    )]
    pub seller_trade_state: Account<'info, SellerTradeState>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,

    /// CHECK: Not dangerous. Account seeds checked in constraint.
    #[account(
        seeds=[
            PREFIX.as_bytes(), 
            SIGNER.as_bytes()
            ], 
        bump=program_as_signer_bump
    )]
    pub program_as_signer: UncheckedAccount<'info>,

    pub rent: Sysvar<'info, Rent>,
}

pub fn sell<'info> (
    ctx :Context<'_, '_, '_, 'info, Sell<'info>>,
    args : SellArgs
) -> Result<()> {
    sell_logic(ctx, args)
}

pub fn sell_logic<'info> (
    ctx :Context<'_, '_, '_, 'info, Sell<'info>>,
    args : SellArgs
) -> Result<()>{
    let SellArgs {
        metadata_bump ,
        program_as_signer_bump ,
        buyer_price ,
        token_size ,
    } = args;

    // NOTE: extract all variables from ctx (Sell struct)
    let wallet = &ctx.accounts.wallet;
    let token_account = &ctx.accounts.token_account;
    let metadata_account = &ctx.accounts.metadata_account;
    let authority = &ctx.accounts.authority;
    let gay_dungeon = &ctx.accounts.gay_dungeon;
    let gay_dungeon_fee_account = &ctx.accounts.gay_dungeon_fee_account;
    let seller_trade_state = &mut ctx.accounts.seller_trade_state;
    let token_program = &ctx.accounts.token_program;
    let system_program = &ctx.accounts.system_program;
    let program_as_signer = &ctx.accounts.program_as_signer;
    let rent = &ctx.accounts.rent;


    // NOTE: Approve the `program_as_signer` to be the delegate of the token_account
    if wallet.is_signer {
        invoke(
            &approve(
                &token_program.key(),
                &token_account.key(),
                &program_as_signer.key(),
                &wallet.key(),
                &[],
                token_size,
            )
            .unwrap(),
            &[
                token_program.to_account_info(),
                token_account.to_account_info(),
                program_as_signer.to_account_info(),
                wallet.to_account_info(),
            ],
        )?;
    }

    // NOTE: populate the seller_trade_state (except highest_bidder)
    let seller_trade_state_info = seller_trade_state.to_account_info();
    if seller_trade_state_info.data_is_empty() {
        seller_trade_state.ata =  token_account.key();
        seller_trade_state.price = buyer_price;
    }
    
    Ok(())
}