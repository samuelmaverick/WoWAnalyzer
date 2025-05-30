import {
  AIMED_SHOT_BASELINE_CAST_TIME,
  STREAMLINE_AIMED_SHOT_CAST_SPEED_UP,
  STREAMLINE_RAPID_FIRE_DAMAGE_INCREASE,
  TRUESHOT_AIMED_SHOT_CAST_TIME_SPEED_UP,
} from 'analysis/retail/hunter/marksmanship/constants';
import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_HUNTER } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, { DamageEvent } from 'parser/core/Events';
import Haste from 'parser/shared/modules/Haste';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/**
 * Rapid Fire's damage is increased by 15%.
 * Rapid Fire also causes your next Aimed Shot to cast 30% faster.
 *
 * Example log:
 *
 */
class Streamline extends Analyzer {
  static dependencies = {
    haste: Haste,
  };

  damage = 0;
  aimedShotCastTimeSaved = 0;

  protected haste!: Haste;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_HUNTER.STREAMLINE_TALENT);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.RAPID_FIRE_DAMAGE),
      this.onRapidFireDamage,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_HUNTER.AIMED_SHOT_TALENT),
      this.onAimedShotCast,
    );
  }

  onRapidFireDamage(event: DamageEvent) {
    this.damage += calculateEffectiveDamage(event, STREAMLINE_RAPID_FIRE_DAMAGE_INCREASE);
  }

  onAimedShotCast() {
    if (!this.selectedCombatant.hasBuff(SPELLS.STREAMLINE_BUFF.id)) {
      return;
    }
    /** Lock and Load suppresses streamline consumption so it's not possible to waste the decreased casting time from Streamline */
    if (this.selectedCombatant.hasBuff(SPELLS.LOCK_AND_LOAD_BUFF.id)) {
      return;
    }
    const hastepercent = this.haste.current;
    const trueshotIncrease = this.selectedCombatant.hasBuff(SPELLS.TRUESHOT.id)
      ? 1 + TRUESHOT_AIMED_SHOT_CAST_TIME_SPEED_UP
      : 1;
    const aimedShotCastTime = AIMED_SHOT_BASELINE_CAST_TIME / (1 + hastepercent) / trueshotIncrease;
    this.aimedShotCastTimeSaved +=
      aimedShotCastTime - aimedShotCastTime / (1 + STREAMLINE_AIMED_SHOT_CAST_SPEED_UP);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            You saved {formatNumber(this.aimedShotCastTimeSaved / 1000)} seconds of Aimed Shot cast
            time through Streamline
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS_HUNTER.STREAMLINE_TALENT}>
          <>
            <ItemDamageDone amount={this.damage} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Streamline;
