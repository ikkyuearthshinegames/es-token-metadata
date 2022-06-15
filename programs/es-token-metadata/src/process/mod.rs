use crate::state::*;
use anchor_lang::prelude::*;
use anchor_spl::token;
use anchor_spl::token::MintTo;

pub fn process_mint_nft(ctx: Context<MintNft>) -> Result<()> {
    msg!("Initializing Mint Ticket");
    let cpi_accounts = MintTo {
        mint: ctx.accounts.mint.to_account_info(),
        to: ctx.accounts.token_account.to_account_info(),
        authority: ctx.accounts.payer.to_account_info(),
    };
    msg!("CPI Accounts Assigned");
    let cpi_program = ctx.accounts.token_program.to_account_info();
    msg!("CPI Program Assigned");
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    msg!("CPI Context Assigned");
    token::mint_to(cpi_ctx, 1)?;
    msg!("Token Minted !!!");

    Ok(())
}

pub fn process_create_metadata(
    ctx: Context<CreateMetadata>,
    args: CreateMetadataArgs,
) -> Result<()> {
    msg!("Creating Metadata...");
    msg!("{:?}", args);

    let metadata = &mut ctx.accounts.metadata;
    metadata.data = args.data;

    Ok(())
}
