import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { SpendResourceEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import SPELLS from 'common/SPELLS/rogue';

/**
 * Deepening Shadows
 * Your finishing moves reduce the remaining cooldown on Shadow Dance by 1.5 sec per combo point spent.
 */
class DeepeningShadows extends Analyzer {
  BASE_CDR = 1000;
  ENVELOPING_SHADOWS_EXTRA_CDR = 500;

  static dependencies = {
    spellUsable: SpellUsable,
  };
  cdrPerComboPoint = 0;
  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.cdrPerComboPoint = this.BASE_CDR;
    this.addEventListener(Events.SpendResource.by(SELECTED_PLAYER), this.onSpendResource);
  }

  onSpendResource(event: SpendResourceEvent) {
    const comboPointsSpent = event.resourceChange;
    if (event.resourceChangeType !== RESOURCE_TYPES.COMBO_POINTS.id) {
      return;
    }

    if (this.spellUsable.isOnCooldown(SPELLS.SHADOW_DANCE.id)) {
      this.spellUsable.reduceCooldown(
        SPELLS.SHADOW_DANCE.id,
        comboPointsSpent * this.cdrPerComboPoint,
      );
    }
  }
}

export default DeepeningShadows;
