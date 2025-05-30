import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, CastEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import HotTrackerMW from '../core/HotTrackerMW';
import { getCurrentRSKTalent, POOL_OF_MISTS_CDR } from '../../constants';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import SpellLink from 'interface/SpellLink';
import { formatDuration, formatNumber } from 'common/format';
import ItemCooldownReduction from 'parser/ui/ItemCooldownReduction';
import Statistic from 'parser/ui/Statistic';
import TalentSpellText from 'parser/ui/TalentSpellText';
import SpellIcon from 'interface/SpellIcon';
import { Talent } from 'common/TALENTS/types';

const POOL_OF_MISTS_ICD = 300;

class PoolOfMists extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    hotTracker: HotTrackerMW,
  };

  protected spellUsable!: SpellUsable;
  protected hotTracker!: HotTrackerMW;

  lastTimestamp = 0;
  cdrEatenByICD = 0;

  remCDR = 0;
  remWaste = 0;
  remEffective = 0;

  rskCDR = 0;
  rskWaste = 0;
  rskEffective = 0;
  currentRskTalent: Talent;

  get extraRSKCasts() {
    return this.rskEffective / this.spellUsable.fullCooldownDuration(this.currentRskTalent.id);
  }

  get extraReMCasts() {
    return (
      this.remEffective /
      this.spellUsable.fullCooldownDuration(TALENTS_MONK.RENEWING_MIST_TALENT.id)
    );
  }

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.POOL_OF_MISTS_TALENT);
    this.currentRskTalent = getCurrentRSKTalent(this.selectedCombatant);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.RENEWING_MIST_HEAL),
      this.onApplyRem,
    );

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(this.currentRskTalent),
      this.onRisingSunKick,
    );
  }

  private onApplyRem(event: ApplyBuffEvent) {
    const playerId = event.targetID;
    const spellId = SPELLS.RENEWING_MIST_HEAL.id;

    if (!this.hotTracker.hasHot(event, spellId)) {
      return;
    }
    const hot = this.hotTracker.hots[playerId][spellId];

    if (
      (this.hotTracker.fromRapidDiffusionEnvelopingMist(hot) ||
        this.hotTracker.fromHardcast(hot)) &&
      !(this.hotTracker.fromBounce(hot) || this.hotTracker.fromDancingMists(hot))
    ) {
      this.rskCDR += POOL_OF_MISTS_CDR;
      if (
        this.spellUsable.isOnCooldown(this.currentRskTalent.id) &&
        event.timestamp > this.lastTimestamp + POOL_OF_MISTS_ICD
      ) {
        const reduction = this.spellUsable.reduceCooldown(
          this.currentRskTalent.id,
          POOL_OF_MISTS_CDR,
        );
        this.rskEffective += reduction;
        this.rskWaste += POOL_OF_MISTS_CDR - reduction;
      } else {
        if (event.timestamp <= this.lastTimestamp + POOL_OF_MISTS_ICD) {
          this.cdrEatenByICD += POOL_OF_MISTS_CDR;
        }
        this.rskWaste += POOL_OF_MISTS_CDR;
      }
    }
    this.lastTimestamp = event.timestamp;
  }

  private onRisingSunKick(event: CastEvent) {
    this.remCDR += POOL_OF_MISTS_CDR;
    if (this.spellUsable.isOnCooldown(TALENTS_MONK.RENEWING_MIST_TALENT.id)) {
      const reduction = this.spellUsable.reduceCooldown(
        TALENTS_MONK.RENEWING_MIST_TALENT.id,
        POOL_OF_MISTS_CDR,
      );
      this.remEffective += reduction;
      this.remWaste += POOL_OF_MISTS_CDR - reduction;
    } else {
      this.remWaste += POOL_OF_MISTS_CDR;
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(11)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <ul>
            <li>
              <SpellLink spell={TALENTS_MONK.RENEWING_MIST_TALENT} /> reduction:{' '}
              {formatDuration(this.remCDR)} ({formatDuration(this.remWaste)} wasted)
            </li>
            <ul>
              <li>{formatNumber(this.extraReMCasts)} additional casts</li>
            </ul>
            <li>
              <SpellLink spell={this.currentRskTalent} /> reduction: {formatDuration(this.rskCDR)} (
              {formatDuration(this.rskWaste)} wasted)
            </li>
            <ul>
              <li>{formatNumber(this.extraRSKCasts)} additional casts</li>
              <li>
                {formatDuration(this.cdrEatenByICD)} seconds eaten by the {POOL_OF_MISTS_ICD}ms ICD
              </li>
            </ul>
          </ul>
        }
      >
        <TalentSpellText talent={TALENTS_MONK.POOL_OF_MISTS_TALENT}>
          <div>
            <SpellIcon spell={TALENTS_MONK.RENEWING_MIST_TALENT} />{' '}
            <ItemCooldownReduction effective={this.remEffective} />
          </div>
          <div>
            <SpellIcon spell={this.currentRskTalent} />{' '}
            <ItemCooldownReduction effective={this.rskEffective} />
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default PoolOfMists;
