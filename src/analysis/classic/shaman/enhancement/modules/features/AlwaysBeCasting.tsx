import { i18n } from '@lingui/core';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS/classic/shaman';
import { SpellLink } from 'interface';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import CoreAlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  get downtimeSuggestionThresholds() {
    return {
      actual: this.downtimePercentage,
      isGreaterThan: {
        minor: 0.25,
        average: 0.3,
        major: 0.35,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.downtimeSuggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <span>
          Your downtime can be improved. Try to reduce time away from the boss. If you have to move,
          use instant cast abilities, such as <SpellLink spell={SPELLS.FLAME_SHOCK} /> or{' '}
          <SpellLink spell={SPELLS.EARTH_SHOCK} />.
        </span>,
      )
        .icon('spell_mage_altertime')
        .actual(
          i18n._('shared.suggestions.alwaysBeCasting.downtime', { 0: formatPercentage(actual) }),
        )
        .recommended(`<${formatPercentage(recommended)}% is recommended`),
    );
  }
}

export default AlwaysBeCasting;
