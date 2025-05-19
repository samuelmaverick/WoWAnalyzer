import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/evoker';
import { formatNumber } from 'common/format';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Events, { DamageEvent, CastEvent } from 'parser/core/Events';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';

import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { EYE_OF_INFINITY_MULTIPLIER } from 'analysis/retail/evoker/devastation/constants';
import TalentSpellText from 'parser/ui/TalentSpellText';

class EyeOfInfinity extends Analyzer {
  eyeOfInfinityDamage = 0;
  eternitySurgeMainTarget = 0;
  disintegrateMainTarget = 0;
  lastEternitySurgeHit = 0;
  hitCounter = 0;

  eternitySurge = [SPELLS.ETERNITY_SURGE, SPELLS.ETERNITY_SURGE_FONT];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.EYE_OF_INFINITY_TALENT);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.ETERNITY_SURGE_DAM),
      this.onHit,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.DISINTEGRATE),
      this.onDisintegrateCast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(this.eternitySurge),
      this.onEternitySurgeCast,
    );
  }

  onDisintegrateCast(event: CastEvent) {
    if (event.targetID !== undefined) {
      this.disintegrateMainTarget = event.targetID;
    }
  }
  onEternitySurgeCast(event: CastEvent) {
    if (event.targetID !== undefined) {
      this.eternitySurgeMainTarget = event.targetID;
    }
  }

  onHit(event: DamageEvent) {
    if (
      (event.targetID === this.disintegrateMainTarget ||
        event.targetID === this.eternitySurgeMainTarget) &&
      event.timestamp > this.lastEternitySurgeHit
    ) {
      this.lastEternitySurgeHit = event.timestamp;
      this.eyeOfInfinityDamage += calculateEffectiveDamage(event, EYE_OF_INFINITY_MULTIPLIER);
      this.hitCounter += 1;
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <li>Damage: {formatNumber(this.eyeOfInfinityDamage)}</li>
          </>
        }
      >
        <TalentSpellText talent={TALENTS.EYE_OF_INFINITY_TALENT}>
          <ItemDamageDone amount={this.eyeOfInfinityDamage} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default EyeOfInfinity;
