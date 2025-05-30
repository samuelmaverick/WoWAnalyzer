import { defineMessage } from '@lingui/core/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { NumberThreshold, ThresholdStyle, When } from 'parser/core/ParseResults';
import DamageTracker from 'parser/shared/modules/AbilityTracker';

import BetweenTheEyesDamageTracker from './BetweenTheEyesDamageTracker';

class Dispatch extends Analyzer {
  get thresholds(): NumberThreshold {
    const total = this.damageTracker.getAbility(SPELLS.DISPATCH.id);
    const filtered = this.betweenTheEyesDamageTracker.getAbility(SPELLS.DISPATCH.id);

    return {
      actual: filtered.casts / total.casts,
      isGreaterThan: {
        minor: 0,
        average: 0.1,
        major: 0.2,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get delayedCastSuggestion() {
    return (
      <>
        Whenever you have the <SpellLink spell={SPELLS.RUTHLESS_PRECISION} /> buff, you should
        prioritize <SpellLink spell={SPELLS.BETWEEN_THE_EYES} /> as your damaging spender.
      </>
    );
  }

  static dependencies = {
    damageTracker: DamageTracker,
    betweenTheEyesDamageTracker: BetweenTheEyesDamageTracker,
  };

  protected damageTracker!: DamageTracker;
  protected betweenTheEyesDamageTracker!: BetweenTheEyesDamageTracker;

  suggestions(when: When) {
    when(this.thresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You casted <SpellLink spell={SPELLS.DISPATCH} /> while{' '}
          <SpellLink spell={SPELLS.BETWEEN_THE_EYES} /> was available. {this.delayedCastSuggestion}
        </>,
      )
        .icon(SPELLS.DISPATCH.icon)
        .actual(
          defineMessage({
            id: 'rogue.outlaw.dispatch.efficiency',
            message: `${formatPercentage(actual)}% inefficient casts`,
          }),
        )
        .recommended(`${formatPercentage(recommended)}% is recommended`),
    );
  }
}

export default Dispatch;
