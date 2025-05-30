import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { HealEvent } from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import {
  ABILITIES_AFFECTED_BY_HEALING_INCREASES,
  ENVELOPING_MIST_INCREASE,
  MISTWRAP_INCREASE,
} from '../../constants';
import { isFromEnvelopingMist } from '../../normalizers/CastLinkNormalizer';
import HotTrackerMW from '../core/HotTrackerMW';

const UNAFFECTED_SPELLS: number[] = [TALENTS_MONK.ENVELOPING_MIST_TALENT.id];

class EnvelopingMists extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    hotTracker: HotTrackerMW,
  };
  healingIncrease = 0;
  evmHealingIncrease = 0;
  gustsHealing = 0;
  protected combatants!: Combatants;
  protected hotTracker!: HotTrackerMW;

  constructor(options: Options) {
    super(options);
    this.evmHealingIncrease = this.selectedCombatant.hasTalent(TALENTS_MONK.MIST_WRAP_TALENT)
      ? ENVELOPING_MIST_INCREASE + MISTWRAP_INCREASE
      : ENVELOPING_MIST_INCREASE;
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.handleEnvelopingMist);

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.GUSTS_OF_MISTS),
      this.masteryEnvelopingMist,
    );
  }

  masteryEnvelopingMist(event: HealEvent) {
    if (isFromEnvelopingMist(event)) {
      this.gustsHealing += (event.amount || 0) + (event.absorbed || 0);
    }
  }

  handleEnvelopingMist(event: HealEvent) {
    const targetId = event.targetID;
    const spellId = event.ability.guid;

    if (
      UNAFFECTED_SPELLS.includes(spellId) ||
      !ABILITIES_AFFECTED_BY_HEALING_INCREASES.includes(event.ability.guid)
    ) {
      return;
    }

    if (
      !this.hotTracker.hots[targetId] ||
      !this.hotTracker.hots[targetId][TALENTS_MONK.ENVELOPING_MIST_TALENT.id]
    ) {
      return;
    }

    this.healingIncrease += calculateEffectiveHealing(event, this.evmHealingIncrease);
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.OPTIONAL(0)}
        category={STATISTIC_CATEGORY.THEORYCRAFT}
        tooltip={<>This is the effective healing contributed by the Enveloping Mist buff.</>}
      >
        <BoringSpellValueText spell={TALENTS_MONK.ENVELOPING_MIST_TALENT}>
          <>
            {formatNumber(this.healingIncrease)} <small>healing from the buff</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default EnvelopingMists;
