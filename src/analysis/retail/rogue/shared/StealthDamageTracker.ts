import TALENTS from 'common/TALENTS/rogue';
import { Options } from 'parser/core/Analyzer';

import FilteredDamageTracker from './FilteredDamageTracker';
import { isStealth } from './IsStealth';

class StealthDamageTracker extends FilteredDamageTracker {
  // Workaround for stealth getting removed "before" the cast.
  delayWindow = 100;

  constructor(options: Options) {
    super(options);

    if (this.selectedCombatant.hasTalent(TALENTS.SUBTERFUGE_TALENT)) {
      //Subterfuge allows use of stealth abilities for 3 seconds after stealth fades
      this.delayWindow += 3000;
    }
  }

  shouldProcessEvent(event: never) {
    return isStealth(this.selectedCombatant, this.delayWindow);
  }
}

export default StealthDamageTracker;
