
use anchor_lang::{
    prelude::*,
   
    AnchorDeserialize, AnchorSerialize,
};

use anchor_spl::{
    token::{Token, Mint}, 
    associated_token::AssociatedToken
};

use crate::{state::*, gay_dungeon};

use crate::constants::*;
use crate::utils::*;
use crate::errors::*;

#[derive(Accounts)]
#[instruction()]
pub struct CreateGayDungeon<'info> {

     /// treasury account
     pub treasury_mint: Account<'info, Mint>,

    #[account(mut)]
    pub payer: Signer<'info>,

    /// CHECK: User can use whatever they want for intialization.
    pub authority: UncheckedAccount<'info>,

    /// CHECK: User can use whatever they want for intialization.
    #[account(mut)]
    pub fee_withdrawal_destination: UncheckedAccount<'info>,

    /// CHECK: User can use whatever they want for intialization.
    /// SOL or SPL token account to receive Auction House fees. If treasury mint is native this will be the same as the `treasury_withdrawl_destination_owner`.
    #[account(mut)]
    pub treasury_withdrawal_destination: UncheckedAccount<'info>,

    /// CHECK: User can use whatever they want for intialization.
    /// Owner of the `treasury_withdrawal_destination` account are the same address if the `treasury_mint` is native.
    pub treasury_withdrawal_destination_owner: UncheckedAccount<'info>,

    /// gay_dungeon PDA instance
    #[account(
        init,
        seeds = [
            PREFIX.as_bytes(),
            authority.key().as_ref(),
            treasury_mint.key().as_ref()
        ],
        payer = payer,
        space = GAY_DUNGEON_SIZE,
        bump,
        
    )]
    pub gay_dungeon: Account<'info, GayDungeon>,

    /// CHECK: validate via seeds
    #[account(
        init,
        seeds = [
            PREFIX.as_bytes(),
            gay_dungeon.key().as_ref(),
            FEE_PAYER.as_bytes()
        ],
        payer = payer,
        space = GAY_DUNGEON_FEE_PAYER_SIZE,
        bump
    )]
    pub gay_dungeon_fee_account : UncheckedAccount<'info>,

    /// CHECK: validate via seeds
    #[account(
        init,
        seeds = [
            PREFIX.as_bytes(),
            gay_dungeon.key().as_ref(),
            TREASURY.as_bytes()
        ],
        payer = payer,
        space = GAY_DUNGEON_TREASURY_SIZE,
        bump
    )]
    pub gay_dungeon_treasury: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub ata_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>

}

pub fn create_gay_dungeon <'info> (
    ctx: Context<'_, '_, '_, 'info, CreateGayDungeon<'info>>,
    args : CreateGayDungeonArgs
) -> Result<()> {


    create_gay_dungeon_logic(ctx, args)
}

pub fn create_gay_dungeon_logic <'info> (
    ctx: Context<'_, '_, '_, 'info, CreateGayDungeon<'info>>,
    args : CreateGayDungeonArgs
) -> Result<()> {

    // NOTE: extract arguments
    let CreateGayDungeonArgs {
        gay_dungeon_bump,
        gay_dungeon_treasury_bump,
        gay_dungeon_fee_payer_bump,
        seller_fee_basis_points,
        requires_sign_off,
        can_change_sale_price
    } = args;

    // NOTE: extract context
    let treasury_mint = &ctx.accounts.treasury_mint;
    let payer = &ctx.accounts.payer;
    let authority = &ctx.accounts.authority;
    let fee_withdrawal_destination = &ctx.accounts.fee_withdrawal_destination;
    let treasury_withdrawal_destination = &ctx.accounts.treasury_withdrawal_destination;
    let treasury_withdrawal_destination_owner =
        &ctx.accounts.treasury_withdrawal_destination_owner;
    let gay_dungeon = &mut ctx.accounts.gay_dungeon;
    let gay_dungeon_fee_account = &ctx.accounts.gay_dungeon_fee_account;
    let gay_dungeon_treasury = &ctx.accounts.gay_dungeon_treasury;


    let token_program = &ctx.accounts.token_program;
    let system_program = &ctx.accounts.system_program;
    let ata_program = &ctx.accounts.ata_program;
    let rent = &ctx.accounts.rent;

    msg!("gay_dungeon_bump {}", gay_dungeon_bump);
    msg!("treasury_withdrawal_destination.key(); {}", treasury_withdrawal_destination.key());

    
    // NOTE: populate gay_dungeon
    gay_dungeon.creator = payer.key();
    gay_dungeon.bump = gay_dungeon_bump;
    gay_dungeon.fee_payer_bump = gay_dungeon_fee_payer_bump;
    gay_dungeon.treasury_bump = gay_dungeon_treasury_bump;
    gay_dungeon.treasury_mint = treasury_mint.key();
    gay_dungeon.authority = authority.key();
    gay_dungeon.fee_withdrawal_destination = fee_withdrawal_destination.key();
    gay_dungeon.treasury_withdrawal_destination = treasury_withdrawal_destination.key();
    gay_dungeon.gay_dungeon_fee_account = gay_dungeon_fee_account.key();
    gay_dungeon.gay_dungeon_treasury = gay_dungeon_treasury.key();
    gay_dungeon.seller_fee_basis_points = seller_fee_basis_points;
    gay_dungeon.can_change_sale_price = can_change_sale_price;
    gay_dungeon.requires_sign_off = requires_sign_off;

    // let is_native = treasury_mint.key() == spl_token::native_mint::id();

    // let gay_dungeon_key = gay_dungeon.key();

    // let gay_dungeon_treasury_seeds = [
    //         PREFIX.as_bytes(),
    //         gay_dungeon_key.as_ref(),
    //         TREASURY.as_bytes(),
    //         &[gay_dungeon_treasury_bump],
    //     ];

    // // NOTE: create program token account (execute only if is_native is true)
    // create_program_token_account_if_not_present(
    //     gay_dungeon_treasury,
    //     system_program,
    //     payer,
    //     token_program,
    //     treasury_mint,
    //     &gay_dungeon.to_account_info(),
    //     rent,
    //     &gay_dungeon_treasury_seeds,
    //     &[],
    //     is_native,
    // )?;

    // if is_native {
    //     if treasury_withdrawal_destination.key().eq(& treasury_withdrawal_destination_owner.key()) {
    //         // Ok(())
    //         return Err(GayDungeonError::NotEqualKey.into());
    //     } else {
    //         return Err(GayDungeonError::NotEqualKey.into());
    //     }
    // }
    // else {
    //     if treasury_withdrawal_destination.data_is_empty() {
    //         make_ata(
    //             treasury_withdrawal_destination.to_account_info(),
    //             treasury_withdrawal_destination_owner.to_account_info(),
    //             treasury_mint.to_account_info(),
    //             payer.to_account_info(),
    //             ata_program.to_account_info(),
    //             token_program.to_account_info(),
    //             system_program.to_account_info(),
    //             rent.to_account_info(),
    //             &[],
    //         )?;
    //     }

    //     assert_is_ata(
    //         &treasury_withdrawal_destination.to_account_info(),
    //         &treasury_withdrawal_destination_owner.key(),
    //         &treasury_mint.key(),
    //     )?;

        
    // }
    Ok(())
    
}