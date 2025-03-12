import TALENTS from 'common/TALENTS/rogue';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

import DanceDamageTracker from '../../core/DanceDamageTracker';
import DarkShadow from './DarkShadow';

class DarkShadowContribution extends DarkShadow {
  static dependencies = {
    ...DarkShadow.dependencies,
    danceDamageTracker: DanceDamageTracker,
  };

  protected danceDamageTracker!: DanceDamageTracker;

  get darkShadowDamageFactor() {
    const factor = this.selectedCombatant.getTalentRank(TALENTS.DARK_SHADOW_TALENT) * 0.15;
    return factor;
  }

  statistic() {
    const danceDamage =
      (Array.from(this.danceDamageTracker.abilities.values())
        .map((ability) => {
          const damage = ability.damageVal.effective || 0;
          return damage;
        })
        .reduce((a, b) => a + b, 0) *
        this.darkShadowDamageFactor) /
      (1 + this.darkShadowDamageFactor);

    return (
      <Statistic size="flexible" category={STATISTIC_CATEGORY.GENERAL}>
        <BoringSpellValueText spell={TALENTS.DARK_SHADOW_TALENT}>
          <ItemDamageDone amount={danceDamage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DarkShadowContribution;
