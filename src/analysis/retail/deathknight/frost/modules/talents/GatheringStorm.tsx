import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/deathknight';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  CastEvent,
  DamageEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const DAMAGE_BOOST = 0.1;
const DURATION_BOOST_MS = 500;
const debug = false;

/**
 *Each Rune spent during Remorseless Winter increases its damage by 10%, and extends its duration by 0.5 sec.
 */
class GatheringStorm extends Analyzer {
  totalCasts = 0;
  bonusDamage = 0;
  totalStacks = 0;
  currentStacks = 0;
  extendedDuration = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(talents.GATHERING_STORM_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.GATHERING_STORM_TALENT_BUFF),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.GATHERING_STORM_TALENT_BUFF),
      this.onApplyBuffStack,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.REMORSELESS_WINTER_DAMAGE),
      this.onDamage,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.GATHERING_STORM_TALENT_BUFF),
      this.onRemoveBuff,
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
  }

  onApplyBuff(event: ApplyBuffEvent) {
    this.currentStacks = 1;
    this.totalCasts += 1;
    this.totalStacks += 1;
    debug && console.log('applied buff');
  }

  onApplyBuffStack(event: ApplyBuffStackEvent) {
    this.currentStacks += 1;
    this.totalStacks += 1;
    debug && console.log(`added buff stack, now at ${this.currentStacks}`);
  }

  onDamage(event: DamageEvent) {
    const boostedDamage = calculateEffectiveDamage(event, DAMAGE_BOOST * this.currentStacks);
    this.bonusDamage += boostedDamage;
    debug && console.log(`boosted damage with ${this.currentStacks} stacks = ${boostedDamage}`);
  }

  onRemoveBuff(event: RemoveBuffEvent) {
    this.currentStacks = 0;
    debug && console.log(`removed buff`);
  }

  onCast(event: CastEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.REMORSELESS_WINTER.id)) {
      return;
    }
    if (
      event.ability.guid === talents.HOWLING_BLAST_TALENT.id &&
      this.selectedCombatant.hasBuff(SPELLS.RIME.id)
    ) {
      // handles the free HB from Rime proc,
      this.extendedDuration += DURATION_BOOST_MS;
      return;
    }
    if (event.classResources) {
      event.classResources
        .filter((resource) => resource.type === RESOURCE_TYPES.RUNES.id)
        .forEach(({ cost }) => {
          this.extendedDuration = this.extendedDuration + DURATION_BOOST_MS * cost;
          debug &&
            console.log(
              `Added ${DURATION_BOOST_MS * cost} to the duration for a total of ${
                this.extendedDuration
              } boost to duration`,
            );
        });
    }
  }

  get averageExtension() {
    return this.extendedDuration / 1000 / this.totalCasts;
  }

  statistic() {
    return (
      <Statistic position={STATISTIC_ORDER.OPTIONAL()} size="flexible">
        <BoringSpellValueText spell={talents.GATHERING_STORM_TALENT}>
          <>
            <ItemDamageDone amount={this.bonusDamage} /> <br />
            <UptimeIcon /> {this.averageExtension.toFixed(1)}{' '}
            <small>average seconds extended </small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default GatheringStorm;
