pub mod constant;
pub mod process;
pub mod state;

use anchor_lang::prelude::*;
pub use constant::*;
pub use process::*;
pub use state::*;

declare_id!("4cPZHiknrGUbDadU8n15D3GpvDfw1GbcvGoT3ccSg522");

#[program]
pub mod es_token_metadata {
    use super::*;

    pub fn mint_nft(ctx: Context<MintNft>) -> Result<()> {
        process_mint_nft(ctx)
    }

    pub fn create_metadata(ctx: Context<CreateMetadata>, data: CreateMetadataArgs) -> Result<()> {
        process_create_metadata(ctx, data)
    }

    // pub fn update_metadata_account(ctx: Context<UpdateMetadataAccount>) {
    //     process_update_metadata_accounts(ctx)
    // }
}
