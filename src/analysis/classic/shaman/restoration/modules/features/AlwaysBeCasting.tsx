import { formatPercentage } from 'common/format';
import { When } from 'parser/core/ParseResults';
import CoreAlwaysBeCastingHealing from 'parser/shared/modules/AlwaysBeCastingHealing';
import SPELLS from 'common/SPELLS/classic';
import { i18n } from '@lingui/core';

class AlwaysBeCasting extends CoreAlwaysBeCastingHealing {
  HEALING_ABILITIES_ON_GCD: number[] = [
    // List of healing spells on GCD
    SPELLS.RIP_TIDE.id,
    SPELLS.CHAIN_HEAL.id,
    SPELLS.HEALING_WAVE.id,
    SPELLS.HEALING_STREAM_TOTEM.id,
    SPELLS.MANA_SPRING_TOTEM.id,
    SPELLS.PURGE.id,
    SPELLS.STONESKIN_TOTEM.id,
    SPELLS.WATER_SHIELD.id,
  ];

  suggestions(when: When) {
    const deadTimePercentage = this.totalTimeWasted / this.owner.fightDuration;

    when(deadTimePercentage)
      .isGreaterThan(0.25)
      .addSuggestion((suggest, actual, recommended) =>
        suggest('Your downtime can be improved. Try to Always Be Casting (ABC).')
          .icon('spell_mage_altertime')
          .actual(
            i18n._('shared.suggestions.alwaysBeCasting.downtime', { 0: formatPercentage(actual) }),
          )
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(recommended + 0.05)
          .major(recommended + 0.05),
      );
  }
}

export default AlwaysBeCasting;
