import SPELLS from 'common/SPELLS/evoker';
import TALENTS from 'common/TALENTS/evoker';
import Combatant from 'parser/core/Combatant';

export const DISINTEGRATE_TICKS = 4;
export const DISINTEGRATE_CHAINED_TICKS = 5;
export const AZURE_CELERITY_TICKS = 1;

export const GetDisintegrateTicks = (combatant: Combatant) => {
  const hasAzureCelerity = combatant.hasTalent(TALENTS.AZURE_CELERITY_TALENT);
  const disintegrateTicks = hasAzureCelerity
    ? DISINTEGRATE_TICKS + AZURE_CELERITY_TICKS
    : DISINTEGRATE_TICKS;
  const disintegrateChainedTicks = hasAzureCelerity
    ? DISINTEGRATE_CHAINED_TICKS + AZURE_CELERITY_TICKS
    : DISINTEGRATE_CHAINED_TICKS;

  return { disintegrateTicks, disintegrateChainedTicks };
};

export const OPTIMAL_EMPOWER_DRAGONRAGE_GAP_ST_MS = 13000;

export const RED_DAMAGE_SPELLS = [
  SPELLS.PYRE,
  SPELLS.LIVING_FLAME_DAMAGE,
  SPELLS.FIRESTORM_DAMAGE,
  SPELLS.ENGULF_DAMAGE,
  SPELLS.FIRE_BREATH_DOT,
];

// Talent damage multipliers
export const SPELLWEAVERS_DOMINANCE_CRIT_MULTIPLIER = 0.3;
export const SHATTERING_STAR_AMP_MULTIPLIER = 0.2;
export const ARCANE_INTENSITY_MULTIPLIER = 0.08;
export const EYE_OF_INFINITY_MULTIPLIER = 0.15;
export const ENGULFING_BLAZE_MULTIPLIER = 0.25;
export const SCORCHING_EMBERS_MULTIPLIER = 0.2;
export const HONED_AGGRESSION_MULTIPLIER = 0.1;
export const TITANIC_WRATH_MULTIPLIER = 0.15;
export const IRIDESCENCE_MULTIPLIER = 0.2;
export const HEAT_WAVE_MULTIPLIER = 0.15;
export const LAY_WASTE_MULTIPLIER = 0.2;

// Talent multipliers
export const DENSE_ENERGY_ESSENCE_REDUCTION = 1;
export const POWER_SWELL_REGEN_FACTOR = 1;

export const SCINTILLATION_PROC_CHANCE = 0.15;
export const VOLATILITY_PROC_CHANCE = 0.15;

export const CAUSALITY_DISINTEGRATE_CDR_MS = 500;
export const CAUSALITY_PYRE_CDR_MS = 400;
