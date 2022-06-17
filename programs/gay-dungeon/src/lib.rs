#![allow(warnings)]
use anchor_lang::prelude::*;

pub mod bid;
pub mod cancel;
pub mod create_gay_dungeon;
pub mod execute_sale;
pub mod sell;
pub mod constants;
pub mod errors;
pub mod state;
pub mod utils;

use crate::bid::*;
use crate::cancel::*;
use crate::create_gay_dungeon::*;
use crate::execute_sale::*;
use crate::sell::*;

use crate::constants::*;
use crate::errors::*;
use crate::state::*;
use crate::utils::*;


declare_id!("Bz4repUbACRtNKsrTZUhgfNzXKbsu6JcLzawHFqoSz3X");

#[program]
pub mod gay_dungeon {
    use super::*;

    pub fn create_gay_dungeon<'info> (
        ctx: Context<'_, '_,'_,'info, CreateGayDungeon<'info>>, 
        args : CreateGayDungeonArgs
    ) -> Result<()> {
        create_gay_dungeon::create_gay_dungeon(ctx, args)
    }

    pub fn sell <'info> (
        ctx : Context<'_, '_,'_,'info,  Sell<'info>>,
        args: SellArgs
    ) -> Result<()>{
        Ok(())
    }
}

