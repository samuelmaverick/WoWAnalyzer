import SPELLS from 'common/SPELLS/evoker';
import TALENTS from 'common/TALENTS/evoker';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { BREATH_OF_EONS_SPELLS } from '../../constants';

/**
 * Time Skip is a channeled spell that makes cooldowns recover 1000% faster
 * during it's channel. It lasts 2s, 3s with a talent.
 * so if ya mess up, ya don't get the full CDR. The solution used here
 * is timestamp buffapply and buffremove and calculate the amount of CDR in that window.
 */

class TimeSkip extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  protected spellUsable!: SpellUsable;

  timeSkipApplyTimestamp = 0;
  timeSkipRemoveTimestamp = 0;

  spellIdsToCDR = [
    SPELLS.UPHEAVAL,
    SPELLS.UPHEAVAL_FONT,
    SPELLS.FIRE_BREATH,
    SPELLS.FIRE_BREATH_FONT,
    ...BREATH_OF_EONS_SPELLS,
    TALENTS.BLISTERING_SCALES_TALENT,
    TALENTS.SPATIAL_PARADOX_TALENT,
    TALENTS.PRESCIENCE_TALENT,
    TALENTS.BESTOW_WEYRNSTONE_TALENT,
    TALENTS.QUELL_TALENT,
    SPELLS.HOVER,
    SPELLS.WING_BUFFET,
    SPELLS.TAIL_SWIPE,
    TALENTS.TIME_SPIRAL_TALENT,
    TALENTS.ZEPHYR_TALENT,
    TALENTS.RESCUE_TALENT,
    SPELLS.EMERALD_BLOSSOM,
    TALENTS.UNRAVEL_TALENT,
    TALENTS.OPPRESSING_ROAR_TALENT,
    TALENTS.CAUTERIZING_FLAME_TALENT,
    TALENTS.SLEEP_WALK_TALENT,
    TALENTS.VERDANT_EMBRACE_TALENT,
    TALENTS.LANDSLIDE_TALENT,
    TALENTS.RENEWING_BLAZE_TALENT,
    TALENTS.OBSIDIAN_SCALES_TALENT,
    TALENTS.EXPUNGE_TALENT,
    TALENTS.EBON_MIGHT_TALENT,
    TALENTS.TIP_THE_SCALES_TALENT,
    TALENTS.TIME_SKIP_TALENT,
    SPELLS.BLESSING_OF_THE_BRONZE,
    SPELLS.FURY_OF_THE_ASPECTS,
  ].map((x) => x.id);

  // Amount to CDR for each MS.
  CDR_MS = 10;

  MAX_CDR = this.selectedCombatant.hasTalent(TALENTS.TOMORROW_TODAY_TALENT) ? 30000 : 20000;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.TIME_SKIP_TALENT);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS.TIME_SKIP_TALENT),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(TALENTS.TIME_SKIP_TALENT),
      this.onRemoveBuff,
    );
  }

  onApplyBuff(event: ApplyBuffEvent) {
    this.timeSkipApplyTimestamp = event.timestamp;
  }
  onRemoveBuff(event: RemoveBuffEvent) {
    this.timeSkipRemoveTimestamp = event.timestamp;

    this.calculateCDR();
  }

  private calculateCDR() {
    let CDRAmount = (this.timeSkipRemoveTimestamp - this.timeSkipApplyTimestamp) * this.CDR_MS;
    if (CDRAmount > this.MAX_CDR) {
      CDRAmount = this.MAX_CDR;
    }

    this.spellIdsToCDR.forEach((spellId) => {
      if (!this.spellUsable.isOnCooldown(spellId)) {
        return;
      }
      let amountToCDR = CDRAmount;

      // Spells with charges don't like getting 2 charges reduced at once, so this is a workaround.
      // example prescience in this log: https://www.warcraftlogs.com/reports/ykxmq2ZDrKTWH7Fj/?fight=4&source=1
      if (this.spellUsable.chargesOnCooldown(spellId) > 1) {
        const remainingCooldown = this.spellUsable.cooldownRemaining(spellId);
        if (remainingCooldown < amountToCDR) {
          amountToCDR -= this.spellUsable.reduceCooldown(spellId, remainingCooldown);
        }
      }

      this.spellUsable.reduceCooldown(spellId, amountToCDR);
    });
  }
}

export default TimeSkip;
