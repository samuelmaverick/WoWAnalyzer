import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { HealEvent } from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import {
  ABILITIES_AFFECTED_BY_HEALING_INCREASES,
  ENVELOPING_BREATH_INCREASE,
  ENVELOPING_MIST_INCREASE,
  MISTWRAP_INCREASE,
} from '../../constants';
import HotTrackerMW from '../core/HotTrackerMW';
import { Tracker } from 'parser/shared/modules/HotTracker';

const ENVELOPING_BASE_DURATION = 6000;

class MistWrap extends Analyzer {
  effectiveHealing = 0;
  overHealing = 0;
  envMistHealingBoost = 0;
  envBreathHealingBoost = 0;
  mendingProliferationBoost = 0;
  mendingProliferationActive = false;

  static dependencies = {
    hotTracker: HotTrackerMW,
    combatants: Combatants,
  };
  protected hotTracker!: HotTrackerMW;
  protected combatants!: Combatants;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.MIST_WRAP_TALENT);
    if (!this.active) {
      return;
    }
    this.mendingProliferationActive = this.selectedCombatant.hasTalent(
      TALENTS_MONK.MENDING_PROLIFERATION_TALENT,
    );
    this.addEventListener(
      Events.heal
        .by(SELECTED_PLAYER)
        .spell([SPELLS.ENVELOPING_BREATH_HEAL, TALENTS_MONK.ENVELOPING_MIST_TALENT]),
      this.hotHeal,
    );
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.genericHeal);
  }

  hotHeal(event: HealEvent) {
    const targetId = event.targetID;
    const spellId = event.ability.guid;
    if (!this.hotTracker.hots[targetId] || !this.hotTracker.hots[targetId][spellId]) {
      return;
    }

    const hot = this.hotTracker.hots[targetId][spellId];
    if (hot) {
      if (hot.start + ENVELOPING_BASE_DURATION < event.timestamp && hot.extensions?.length === 0) {
        this.effectiveHealing += event.amount + (event.absorbed || 0);
        this.overHealing += event.overheal || 0;
      } else {
        const totalExtension = hot.extensions.reduce((sum, cur) => sum + cur.amount, 0);
        if (hot.start + ENVELOPING_BASE_DURATION + totalExtension < event.timestamp) {
          this.effectiveHealing += event.amount + (event.absorbed || 0);
          this.overHealing += event.overheal || 0;
        }
      }
    }
  }

  genericHeal(event: HealEvent) {
    const spellId = event.ability.guid;

    if (!ABILITIES_AFFECTED_BY_HEALING_INCREASES.includes(event.ability.guid)) {
      return;
    }

    //enveloping mist is only increased by enveloping breath
    if (spellId === TALENTS_MONK.ENVELOPING_MIST_TALENT.id) {
      this.calculateEnvelopingBreath(event);
      return;
    }

    //enveloping breath is not increased by itself
    if (spellId === SPELLS.ENVELOPING_BREATH_HEAL.id) {
      this.calculateEnvelopingMist(event);
      this.calculateMendingProliferation(event);
      return;
    }

    this.calculateEnvelopingBreath(event);
    this.calculateEnvelopingMist(event);
    this.calculateMendingProliferation(event);
  }

  private calculateEnvelopingBreath(event: HealEvent) {
    const envBreathHot = this.getHot(event, SPELLS.ENVELOPING_BREATH_HEAL.id);
    if (envBreathHot && envBreathHot.start + ENVELOPING_BASE_DURATION < event.timestamp) {
      this.envBreathHealingBoost += calculateEffectiveHealing(event, ENVELOPING_BREATH_INCREASE);
    }
  }

  private calculateEnvelopingMist(event: HealEvent) {
    const envMistHot = this.getHot(event, TALENTS_MONK.ENVELOPING_MIST_TALENT.id);
    if (envMistHot) {
      //check for extensions
      if (envMistHot.extensions?.length === 0) {
        //bonus healing is 40% from additional time or 10% from additional healing based on timestamp
        this.envMistHealingBoost +=
          envMistHot.start + ENVELOPING_BASE_DURATION < event.timestamp
            ? calculateEffectiveHealing(event, ENVELOPING_MIST_INCREASE + MISTWRAP_INCREASE)
            : calculateEffectiveHealing(event, MISTWRAP_INCREASE);
      } else {
        //get total extensions and apply bonus healing
        //This whole block is a necessary bandaid because misty peaks procs silently extend the duration
        //and reset the extension cap on existing enveloping mist without a refresh event
        const totalExtension = envMistHot.extensions.reduce((sum, cur) => sum + cur.amount, 0);
        const totalDuration = event.timestamp - envMistHot.start;

        if (totalDuration > Number(envMistHot.maxDuration)) {
          this.envMistHealingBoost += calculateEffectiveHealing(event, MISTWRAP_INCREASE);
        } else {
          this.envMistHealingBoost +=
            envMistHot.start + ENVELOPING_BASE_DURATION + totalExtension < event.timestamp
              ? calculateEffectiveHealing(event, ENVELOPING_MIST_INCREASE + MISTWRAP_INCREASE)
              : calculateEffectiveHealing(event, MISTWRAP_INCREASE);
        }
      }
    }
  }

  private calculateMendingProliferation(event: HealEvent) {
    const combatant = this.combatants.getEntity(event);
    const hasMendingProliferation =
      combatant && combatant.hasBuff(SPELLS.MENDING_PROLIFERATION_BUFF.id);

    //mending proliferation gets the additional 10% bonus as well, this bonus stacks with the regular env bonus
    if (hasMendingProliferation) {
      this.mendingProliferationBoost += calculateEffectiveHealing(event, MISTWRAP_INCREASE);
    }
  }

  private getHot(event: HealEvent, spellId: number): Tracker | undefined {
    return this.hotTracker.hots[event.targetID]
      ? this.hotTracker.hots[event.targetID][spellId] || undefined
      : undefined;
  }

  get totalHealing() {
    return (
      this.envBreathHealingBoost +
      this.envMistHealingBoost +
      this.mendingProliferationBoost +
      this.effectiveHealing
    );
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink spell={TALENTS_MONK.MIST_WRAP_TALENT} />}
        value={`${formatPercentage(
          this.owner.getPercentageOfTotalHealingDone(this.totalHealing),
        )} %`}
      />
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(5)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            Effective HoT Healing: {formatNumber(this.effectiveHealing)}
            <br />
            HoT Overhealing: {formatNumber(this.overHealing)}
            <br />
            Bonus Healing from extra <SpellLink
              spell={SPELLS.ENVELOPING_BREATH_HEAL}
            /> duration: {formatNumber(this.envBreathHealingBoost)}
            <br />
            Bonus Healing from extra <SpellLink spell={TALENTS_MONK.ENVELOPING_MIST_TALENT} />{' '}
            duration: {formatNumber(this.envMistHealingBoost)}
            {this.mendingProliferationActive && (
              <>
                <br />
                Bonus Healing from <SpellLink
                  spell={TALENTS_MONK.MENDING_PROLIFERATION_TALENT}
                /> : {formatNumber(this.mendingProliferationBoost)}
              </>
            )}
          </>
        }
      >
        <TalentSpellText talent={TALENTS_MONK.MIST_WRAP_TALENT}>
          <ItemHealingDone amount={this.totalHealing} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default MistWrap;
