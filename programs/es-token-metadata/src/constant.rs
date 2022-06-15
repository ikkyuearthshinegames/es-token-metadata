pub const PROGRAM_ID: &str = "";
pub const METADATA_SEED_KEY: &str = "es-metadata";

// Data Sizes
// ref: https://book.anchor-lang.com/anchor_references/space.html
pub const METADATA_SIZE: usize =
32 // pub mint: Pubkey,
+ 32 // pub update_authority: Pubkey,
+ DATA_SIZE// pub data: Data,
+ 1 // pub is_mutable: bool,
;

pub const DATA_SIZE:usize = 
4 + 128 // pub name: String,
+ 4 + 128 // pub symbol: String,
+ 4 + 128 // pub uri: String,
+ 16 // pub seller_fee_basis_points: u16,
+ 1 + 4 + (5 * CREATOR_SIZE) //pub creators: Option<Vec<Creator>>,
;

pub const CREATOR_SIZE: usize = 
32 // pub address: Pubkey,
+ 1 // pub verified: bool,
+ 64 // pub share: u64,
;