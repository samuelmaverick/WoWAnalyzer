import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import Spell from 'common/SPELLS/Spell';

// Based on spelldata for Avenging Wrath
// Avenging Wrath also increases melee damage by 20% - this is added in their modules.
export const ABILITIES_AFFECTED_BY_DAMAGE_INCREASES = [
  SPELLS.CRUSADER_STRIKE,
  SPELLS.JUDGMENT_CAST,
  SPELLS.TEMPLARS_VERDICT_DAMAGE,
  SPELLS.BLADE_OF_JUSTICE,
  SPELLS.DIVINE_STORM_DAMAGE,
  SPELLS.CONSECRATION_CAST,
  SPELLS.ZEAL_DAMAGE,
  SPELLS.HAMMER_OF_WRATH,
  SPELLS.WAKE_OF_ASHES,
  SPELLS.SANCTIFIED_WRATH_DAMAGE,
  TALENTS.EXECUTION_SENTENCE_RETRIBUTION_TALENT,
  TALENTS.JUSTICARS_VENGEANCE_RETRIBUTION_TALENT,
  TALENTS.EYE_FOR_AN_EYE_RETRIBUTION_TALENT,
];

// Stuff like Retribution mastery and Execution sentence increases damage done by these sources of holy damage
export const ABILITIES_AFFECTED_BY_HOLY_DAMAGE_INCREASES = [
  SPELLS.JUDGMENT_CAST,
  SPELLS.TEMPLARS_VERDICT_DAMAGE,
  SPELLS.DIVINE_STORM_DAMAGE,
  SPELLS.CONSECRATION_CAST,
  SPELLS.ZEAL_DAMAGE,
  SPELLS.HAMMER_OF_WRATH,
  SPELLS.WAKE_OF_ASHES,
  SPELLS.SANCTIFIED_WRATH_DAMAGE,
  TALENTS.JUSTICARS_VENGEANCE_RETRIBUTION_TALENT,
];

export const HOLY_POWER_FINISHERS: Spell[] = [
  SPELLS.DIVINE_STORM,
  SPELLS.TEMPLARS_VERDICT_DAMAGE,
  SPELLS.FINAL_VERDICT_FINISHER,
  TALENTS.EXECUTION_SENTENCE_RETRIBUTION_TALENT,
  TALENTS.JUSTICARS_VENGEANCE_RETRIBUTION_TALENT,
];

export const EMPYREAN_POWER_CHANCE = 0.15;
