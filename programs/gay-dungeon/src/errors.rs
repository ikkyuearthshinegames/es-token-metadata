use anchor_lang::prelude::*;

#[error_code]
pub enum GayDungeonError {
    #[msg("The account is not mutable")]
    NotMutableAccount,

    #[msg("Public key comparison returns false")]
    NotEqualKey,

    #[msg("Cannot initialized the account")]
    UninitializedAccount,

    #[msg("The given account is not an owner")]
    IncorrectOwner,

}