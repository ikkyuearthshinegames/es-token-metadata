pub mod constants;
pub mod errors;
pub mod process;
pub mod state;
pub mod utils;

use anchor_lang::prelude::*;
pub use constants::*;
pub use errors::*;
pub use process::*;
pub use state::*;
pub use utils::*;

declare_id!("4cPZHiknrGUbDadU8n15D3GpvDfw1GbcvGoT3ccSg522");

#[program]
pub mod es_token_metadata {
    use super::*;

    pub fn mint_nft(ctx: Context<MintNft>) -> Result<()> {
        process_mint_nft(ctx)
    }

    pub fn create_metadata(ctx: Context<CreateMetadata>, args: CreateMetadataArgs) -> Result<()> {
        process_create_metadata(ctx, args)
    }

    pub fn update_metadata(ctx: Context<UpdateMetadata>, args: UpdateMetadataArgs) -> Result<()> {
        process_update_metadata(ctx, args)
    }
}
