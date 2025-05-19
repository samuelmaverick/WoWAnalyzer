import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { TooltipElement } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveResourceRestored } from 'parser/core/EventCalculateLib';
import Events, { ApplyBuffEvent, ResourceChangeEvent } from 'parser/core/Events';
import ItemManaGained from 'parser/ui/ItemManaGained';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { getManaTeaChannelDuration } from '../../normalizers/CastLinkNormalizer';
import GlobalCooldown from '../core/GlobalCooldown';

const MANA_INCREASE = 0.2;

class EnergizingBrew extends Analyzer {
  static dependencies = {
    globalCooldown: GlobalCooldown,
  };
  protected globalCooldown!: GlobalCooldown;
  totalRestored = 0;
  timeSaved = 0;
  totalTeas = 0;
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.ENERGIZING_BREW_TALENT);
    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(SPELLS.MANA_TEA_CAST),
      this.onManaRestore,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.MANA_TEA_BUFF),
      this.onApplyBuff,
    );
  }

  onManaRestore(event: ResourceChangeEvent) {
    this.totalRestored += calculateEffectiveResourceRestored(event, MANA_INCREASE);
  }

  onApplyBuff(event: ApplyBuffEvent) {
    // no time is saved pre pull
    if (event.prepull) {
      return;
    }
    // channel duration is equal to time saved because its 50% faster
    const duration = getManaTeaChannelDuration(event);
    const gcdTime = this.globalCooldown.getGlobalCooldownDuration(SPELLS.MANA_TEA_CAST.id);
    // if full mana tea duration <= gcd time then we wouldn't have saved any time
    if (!duration || duration <= gcdTime / 2) {
      return;
    }
    this.timeSaved += duration;
    this.totalTeas += 1;
  }

  get avgTimeSaved() {
    return this.timeSaved / this.totalTeas;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(9)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <TalentSpellText talent={TALENTS_MONK.ENERGIZING_BREW_TALENT}>
          <div>
            <ItemManaGained amount={this.totalRestored} useAbbrev />
          </div>
          <div>
            <TooltipElement content={<>Total time saved: {(this.timeSaved / 1000).toFixed(1)}s</>}>
              {(this.avgTimeSaved / 1000).toFixed(1)}s <small>avg time saved</small>
            </TooltipElement>
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default EnergizingBrew;
