import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { TALENTS_MONK } from 'common/TALENTS';
import Events, { ApplyBuffEvent, HealEvent, RefreshBuffEvent } from 'parser/core/Events';
import { isFromMistyPeaks } from '../../normalizers/CastLinkNormalizer';
import HotTrackerMW from '../core/HotTrackerMW';
import { calculateEffectiveHealing, calculateOverhealing } from 'parser/core/EventCalculateLib';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import { formatNumber, formatPercentage } from 'common/format';
import TalentSpellText from 'parser/ui/TalentSpellText';
import SpellLink from 'interface/SpellLink';
import Combatants from 'parser/shared/modules/Combatants';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';
import {
  ABILITIES_AFFECTED_BY_HEALING_INCREASES,
  ENVELOPING_MIST_INCREASE,
  MISTWRAP_INCREASE,
} from '../../constants';

const UNAFFECTED_SPELLS = [TALENTS_MONK.ENVELOPING_MIST_TALENT.id];

class MistyPeaks extends Analyzer {
  static dependencies = {
    hotTracker: HotTrackerMW,
    combatants: Combatants,
  };
  hotTracker!: HotTrackerMW;
  combatants!: Combatants;
  numHots = 0;
  extraHealing = 0;
  extraAbsorb = 0;
  overHealing = 0;
  extraHits = 0;
  envmHealingIncrease = 0;
  extraEnvBonusHealing = 0;
  extraEnvBonusOverhealing = 0;

  get totalHealing() {
    return this.extraHealing + this.extraAbsorb + this.extraEnvBonusHealing;
  }

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.MISTY_PEAKS_TALENT);
    if (!this.active) {
      return;
    }
    this.envmHealingIncrease = this.selectedCombatant.hasTalent(TALENTS_MONK.MIST_WRAP_TALENT)
      ? ENVELOPING_MIST_INCREASE + MISTWRAP_INCREASE
      : ENVELOPING_MIST_INCREASE;
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell([TALENTS_MONK.ENVELOPING_MIST_TALENT]),
      this.handleEnvApply,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell([TALENTS_MONK.ENVELOPING_MIST_TALENT]),
      this.handleEnvApply,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell([TALENTS_MONK.ENVELOPING_MIST_TALENT]),
      this.handleEnvHeal,
    );
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.handleHeal);
  }

  handleEnvApply(event: ApplyBuffEvent | RefreshBuffEvent) {
    if (isFromMistyPeaks(event)) {
      this.numHots += 1;
    }
  }

  handleEnvHeal(event: HealEvent) {
    const playerId = event.targetID;
    if (
      !this.hotTracker.hots[playerId] ||
      !this.hotTracker.hots[playerId][TALENTS_MONK.ENVELOPING_MIST_TALENT.id]
    ) {
      return;
    }
    const hot = this.hotTracker.hots[playerId][TALENTS_MONK.ENVELOPING_MIST_TALENT.id];
    if (this.hotTracker.fromMistyPeaks(hot)) {
      this.extraHits += 1;
      this.extraHealing += event.amount || 0;
      this.extraAbsorb += event.absorbed || 0;
      this.overHealing += event.overheal || 0;
    }
  }

  handleHeal(event: HealEvent) {
    const targetId = event.targetID;
    const spellId = event.ability.guid;
    if (
      UNAFFECTED_SPELLS.includes(spellId) ||
      !ABILITIES_AFFECTED_BY_HEALING_INCREASES.includes(spellId) ||
      !this.hotTracker.hots[targetId] ||
      !this.hotTracker.hots[targetId][TALENTS_MONK.ENVELOPING_MIST_TALENT.id]
    ) {
      return;
    }

    const hot = this.hotTracker.hots[targetId][TALENTS_MONK.ENVELOPING_MIST_TALENT.id];
    if (!this.hotTracker.fromMistyPeaks(hot)) {
      return;
    }
    this.extraEnvBonusHealing += calculateEffectiveHealing(event, this.envmHealingIncrease);
    this.extraEnvBonusOverhealing += calculateOverhealing(event, this.envmHealingIncrease);
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink spell={TALENTS_MONK.MISTY_PEAKS_TALENT} />}
        value={`${formatPercentage(
          this.owner.getPercentageOfTotalHealingDone(this.totalHealing),
        )} %`}
      />
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(4)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <ul>
            <li>
              <SpellLink spell={TALENTS_MONK.MISTY_PEAKS_TALENT} /> procs: {this.numHots}
            </li>
            <li>
              <SpellLink spell={TALENTS_MONK.ENVELOPING_MIST_TALENT} /> extra hits: {this.extraHits}
            </li>
            <li>
              Extra <SpellLink spell={TALENTS_MONK.ENVELOPING_MIST_TALENT} /> direct healing:{' '}
              {formatNumber(this.extraHealing + this.extraAbsorb)} ({formatNumber(this.overHealing)}{' '}
              overheal)
            </li>
            <li>
              Bonus healing from <SpellLink spell={TALENTS_MONK.ENVELOPING_MIST_TALENT} /> buff:{' '}
              {formatNumber(this.extraEnvBonusHealing)} (
              {formatNumber(this.extraEnvBonusOverhealing)} overheal)
            </li>
          </ul>
        }
      >
        <TalentSpellText talent={TALENTS_MONK.MISTY_PEAKS_TALENT}>
          <ItemHealingDone amount={this.totalHealing} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default MistyPeaks;
