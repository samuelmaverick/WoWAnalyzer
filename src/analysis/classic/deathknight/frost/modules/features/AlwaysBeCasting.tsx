import { i18n } from '@lingui/core';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS/classic/deathknight';
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
          Your downtime can be improved. Try to stay within melee range of the boss. If you need to
          move out, used ranged abilities like <SpellLink spell={SPELLS.HOWLING_BLAST} />.
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
