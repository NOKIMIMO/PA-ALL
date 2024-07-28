export enum pole_type {
    SUMNOTE = "SUMNOTE",
    ONE_TURN = "ONE_TURN", //best note wins
    TWO_TURN = "TWO_TURN", //two best notes gets to second turn which is then converted to ONE_TURN
    MULTICHOICE_ONE_TURN = "MULTICHOICE_ONE_TURN", //best note wins
    MULTICHOICE_TWO_TURN = "MULTICHOICE_TWO_TURN", //two best notes gets to second turn which is then converted to MULTICHOICE_ONE_TURN
}
