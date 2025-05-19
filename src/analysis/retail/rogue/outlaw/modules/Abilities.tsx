import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/rogue';
import { SpellLink } from 'interface';
import Combatant from 'parser/core/Combatant';
import ISSUE_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import CoreAbilities from 'parser/core/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    const combatant = this.selectedCombatant;

    const standardGcd = (combatant: Combatant) =>
      1000 * (1 - (combatant.hasBuff(TALENTS.ADRENALINE_RUSH_TALENT.id) ? 0.2 : 0));

    return [
      // // Base class resource
      {
        spell: SPELLS.COMBO_POINT.id,
        category: SPELL_CATEGORY.HIDDEN,
      },
      // Rotational
      {
        spell: [SPELLS.AMBUSH.id, SPELLS.AMBUSH_PROC.id],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: standardGcd,
        },
      },
      {
        spell: SPELLS.DISPATCH.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: standardGcd,
        },
      },
      {
        spell: SPELLS.ROLL_THE_BONES.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 45,
        gcd: {
          static: standardGcd,
        },
      },
      {
        spell: SPELLS.SLICE_AND_DICE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: standardGcd,
        },
      },
      {
        spell: SPELLS.SINISTER_STRIKE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: standardGcd,
        },
      },
      {
        spell: TALENTS.GHOSTLY_STRIKE_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 35,
        gcd: null,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
        },
        enabled: combatant.hasTalent(TALENTS.GHOSTLY_STRIKE_TALENT),
      },
      {
        spell: SPELLS.BETWEEN_THE_EYES.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 45,
        gcd: {
          static: standardGcd,
        },
      },
      {
        spell: SPELLS.PISTOL_SHOT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: standardGcd,
        },
      },
      // Rotational (AOE)
      {
        spell: SPELLS.BLADE_FLURRY.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        cooldown: 30,
        gcd: {
          static: standardGcd,
        },
      },
      // Cooldowns
      {
        spell: TALENTS.ADRENALINE_RUSH_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 180,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
          extraSuggestion: `Using Adrenaline Rush on cooldown is very important and should only be delayed when you know you won't be able to attack for the majority of it's duration.`,
        },
      },
      {
        spell: TALENTS.THISTLE_TEA_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 60,
        charges: 3,
        enabled: combatant.hasTalent(TALENTS.THISTLE_TEA_TALENT),
      },
      {
        spell: TALENTS.COLD_BLOOD_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 45,
        enabled: combatant.hasTalent(TALENTS.COLD_BLOOD_TALENT),
      },
      {
        spell: TALENTS.BLADE_RUSH_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 30,
        gcd: {
          static: standardGcd,
        },
        castEfficiency: {
          suggestion: true,
          extraSuggestion: (
            <>
              You should delay using it to line it up with{' '}
              <SpellLink spell={SPELLS.BLADE_FLURRY} icon /> in AoE scenarios.
            </>
          ),
        },
        enabled: combatant.hasTalent(TALENTS.BLADE_RUSH_TALENT),
      },
      {
        spell: TALENTS.KILLING_SPREE_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 90 * (combatant.hasTalent(TALENTS.DISORIENTING_STRIKES_TALENT) ? 0.9 : 1),
        gcd: {
          static: standardGcd,
        },
        castEfficiency: {
          suggestion: true,
          extraSuggestion: (
            <>
              You should delay using it to line it up with{' '}
              <SpellLink spell={SPELLS.BLADE_FLURRY} icon /> in AoE scenarios.
            </>
          ),
        },
        enabled: combatant.hasTalent(TALENTS.KILLING_SPREE_TALENT),
      },
      {
        spell: TALENTS.KEEP_IT_ROLLING_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 7 * 60,
        gcd: null,
        enabled: combatant.hasTalent(TALENTS.KEEP_IT_ROLLING_TALENT),
      },
      // Defensive
      {
        spell: TALENTS.CLOAK_OF_SHADOWS_TALENT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 120,
        gcd: null,
      },
      {
        spell: SPELLS.CRIMSON_VIAL.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 30,
        gcd: {
          base: 1000, // Adrenaline Rush doesn't decrease this, but Haste does
        },
      },
      {
        spell: SPELLS.FEINT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        buffSpellId: SPELLS.FEINT.id,
        cooldown: 15,
        charges: combatant.hasTalent(TALENTS.GRACEFUL_GUILE_TALENT) ? 2 : 1,
        gcd: null,
      },
      {
        spell: TALENTS.EVASION_TALENT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        buffSpellId: TALENTS.EVASION_TALENT.id,
        cooldown: 120,
        gcd: null,
      },
      // TWW Hero Talents
      {
        spell: SPELLS.COUP_DE_GRACE_CAST.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: combatant.hasTalent(TALENTS.COUP_DE_GRACE_TALENT),
        gcd: {
          static: standardGcd,
        },
      },
      // Others
      {
        spell: SPELLS.PICK_LOCK.id,
        category: SPELL_CATEGORY.OTHERS,
      },
      {
        spell: SPELLS.PICK_POCKET.id,
        category: SPELL_CATEGORY.OTHERS,
        // While this actually has a 0.5s CD, it shows up weird in the Abilities tab if we set that
      },
      // Utility
      {
        spell: SPELLS.VANISH.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 120,
        gcd: null,
        charges: combatant.hasTalent(TALENTS.WITHOUT_A_TRACE_TALENT) ? 2 : 1,
        castEfficiency: {
          suggestion: true,
          extraSuggestion: (
            <>
              In most fights this can be used on cooldown for an{' '}
              <SpellLink spell={SPELLS.AMBUSH} icon />, but it's perfectly fine to save this for a{' '}
              <SpellLink spell={SPELLS.CHEAP_SHOT} icon /> on adds, especially when talented for{' '}
              <SpellLink spell={TALENTS.STING_LIKE_A_BEE_TALENT} icon />.
            </>
          ),
          importance: ISSUE_IMPORTANCE.MINOR,
        },
      },
      {
        spell: SPELLS.GRAPPLING_HOOK.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown:
          45 -
          (combatant.hasTalent(TALENTS.RETRACTABLE_HOOK_TALENT) ? 15 : 0) +
          (combatant.hasTalent(TALENTS.DEATHS_ARRIVAL_TALENT) ? 5 : 0),
        charges: combatant.hasTalent(TALENTS.THRILL_SEEKING_TALENT) ? 2 : 1,
        gcd: null,
      },
      {
        spell: SPELLS.SPRINT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 120 - (combatant.hasTalent(TALENTS.IMPROVED_SPRINT_TALENT) ? 60 : 0),
        gcd: null,
      },
      {
        spell: TALENTS.TRICKS_OF_THE_TRADE_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 30,
        gcd: null,
      },
      {
        spell: SPELLS.STEALTH.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 2,
        gcd: null,
      },
      {
        spell: SPELLS.KICK.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 15,
        gcd: null,
      },
      {
        spell: TALENTS.BLIND_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 120 - (combatant.hasTalent(TALENTS.BLINDING_POWDER_TALENT) ? 30 : 0),
        gcd: {
          static: standardGcd,
        },
      },
      {
        spell: SPELLS.CHEAP_SHOT.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          static: standardGcd,
        },
      },
      {
        spell: SPELLS.DISTRACT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 30,
        gcd: {
          static: standardGcd,
        },
      },
      {
        spell: SPELLS.GOUGE.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 15,
        gcd: {
          static: standardGcd,
        },
      },
      {
        spell: SPELLS.SHROUD_OF_CONCEALMENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 6 * 60,
        gcd: {
          base: 1000,
        },
      },
      {
        spell: SPELLS.SAP.id,
        category: SPELL_CATEGORY.UTILITY,
      },
    ];
  }
}

export default Abilities;
