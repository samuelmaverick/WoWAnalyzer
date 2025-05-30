import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  CastEvent,
  GetRelatedEvents,
  GetRelatedEvent,
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  RefreshBuffEvent,
  HasTarget,
  HasHitpoints,
} from 'parser/core/Events';
import ArcaneChargeTracker from './ArcaneChargeTracker';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { TrackedBuffEvent } from 'parser/core/Entity';
import { encodeTargetString } from 'parser/shared/modules/Enemies';

const TEMPO_DURATION = 12000;

export default class ArcaneBarrage extends Analyzer {
  static dependencies = {
    arcaneChargeTracker: ArcaneChargeTracker,
    spellUsable: SpellUsable,
  };

  protected arcaneChargeTracker!: ArcaneChargeTracker;
  protected spellUsable!: SpellUsable;

  hasArcaneTempo: boolean = this.selectedCombatant.hasTalent(TALENTS.ARCANE_TEMPO_TALENT);
  hasNetherPrecision: boolean = this.selectedCombatant.hasTalent(TALENTS.NETHER_PRECISION_TALENT);
  hasArcaneSoul: boolean = this.selectedCombatant.hasTalent(TALENTS.MEMORY_OF_ALAR_TALENT);

  barrageCasts: ArcaneBarrageCast[] = [];
  lastTempoApply = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.ARCANE_TEMPO_BUFF),
      this.onTempo,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.ARCANE_TEMPO_BUFF),
      this.onTempo,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.ARCANE_TEMPO_BUFF),
      this.onTempo,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.ARCANE_BARRAGE),
      this.onBarrage,
    );
  }

  onTempo(event: ApplyBuffEvent | ApplyBuffStackEvent | RefreshBuffEvent) {
    this.lastTempoApply = event.timestamp;
  }

  onBarrage(event: CastEvent) {
    const hasTempo = this.selectedCombatant.hasBuff(SPELLS.ARCANE_TEMPO_BUFF.id);
    const blastPrecast: CastEvent | undefined = GetRelatedEvent(event, 'SpellPrecast');
    const netherPrecision = this.selectedCombatant.getBuff(SPELLS.NETHER_PRECISION_BUFF.id);
    const charges = this.arcaneChargeTracker.current;
    const targetsHit = GetRelatedEvents(event, 'SpellDamage').length;
    const resource = event.classResources?.find(
      (resource) => resource.type === RESOURCE_TYPES.MANA.id,
    );
    const manaPercent = resource && resource.amount / resource.max;
    const castTarget = HasTarget(event) && encodeTargetString(event.targetID, event.targetInstance);
    const damage = GetRelatedEvents(event, 'SpellDamage');
    const targetHit = damage.find(
      (d) => HasTarget(d) && castTarget === encodeTargetString(d.targetID, d.targetInstance),
    );
    const damageTarget =
      targetHit &&
      HasTarget(targetHit) &&
      encodeTargetString(targetHit.targetID, targetHit.targetInstance);
    const healthPercent =
      targetHit &&
      castTarget === damageTarget &&
      HasHitpoints(targetHit) &&
      targetHit.hitPoints / targetHit.maxHitPoints;

    this.barrageCasts.push({
      cast: event,
      netherPrecisionStacks: netherPrecision ? netherPrecision.stacks : undefined,
      blastPrecast,
      touchCD: this.spellUsable.cooldownRemaining(TALENTS.TOUCH_OF_THE_MAGI_TALENT.id),
      tempoRemaining: hasTempo
        ? TEMPO_DURATION - (event.timestamp - this.lastTempoApply)
        : undefined,
      clearcasting: this.selectedCombatant.hasBuff(
        SPELLS.CLEARCASTING_ARCANE.id,
        event.timestamp - 10,
      ),
      arcaneOrb: this.spellUsable.isAvailable(SPELLS.ARCANE_ORB.id),
      arcaneSoul: this.selectedCombatant.hasBuff(SPELLS.ARCANE_SOUL_BUFF.id),
      burdenOfPower: this.selectedCombatant.hasBuff(SPELLS.BURDEN_OF_POWER_BUFF.id),
      gloriousIncandescence: this.selectedCombatant.hasBuff(
        TALENTS.GLORIOUS_INCANDESCENCE_TALENT.id,
      ),
      intuition: this.selectedCombatant.hasBuff(SPELLS.INTUITION_BUFF.id),
      aethervision: this.selectedCombatant.getBuff(SPELLS.AETHERVISION_BUFF.id),
      charges,
      targetsHit: targetsHit || 0,
      mana: manaPercent,
      health: healthPercent || undefined,
    });

    this.arcaneChargeTracker.clearCharges(event);
  }
}

export interface ArcaneBarrageCast {
  cast: CastEvent;
  netherPrecisionStacks?: number;
  blastPrecast?: CastEvent;
  touchCD: number;
  tempoRemaining?: number;
  clearcasting: boolean;
  arcaneOrb: boolean;
  arcaneSoul: boolean;
  burdenOfPower: boolean;
  gloriousIncandescence: boolean;
  intuition: boolean;
  aethervision?: TrackedBuffEvent;
  charges: number;
  targetsHit: number;
  mana?: number;
  health?: number;
}
