import { i18n } from '@lingui/core';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import CoreAlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  position = STATISTIC_ORDER.CORE(1);

  get downtimeSuggestionThresholds() {
    return {
      actual: this.downtimePercentage,
      isGreaterThan: {
        minor: 0.1,
        average: 0.15,
        major: 0.2,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.downtimeSuggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <span>
          Your downtime can be improved. Try to Always Be Casting (ABC). It's better to cast
          low-priority abilities such as <SpellLink spell={SPELLS.WHIRLWIND_FURY_CAST} /> than it is
          to do nothing.
        </span>,
      )
        .icon('spell_mage_altertime')
        .actual(
          i18n._('shared.suggestions.alwaysBeCasting.downtime', { 0: formatPercentage(actual) }),
        )
        .recommended(`<${formatPercentage(recommended)}% is recommended`)
        .regular(recommended + 0.15)
        .major(recommended + 0.2),
    );
  }
}

export default AlwaysBeCasting;
