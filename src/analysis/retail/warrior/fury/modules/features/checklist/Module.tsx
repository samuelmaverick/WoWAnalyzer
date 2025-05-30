import RageTracker from 'analysis/retail/warrior/shared/modules/core/RageTracker';
import PreparationRuleAnalyzer from 'parser/retail/modules/features/Checklist/PreparationRuleAnalyzer';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';

import RageDetails from '../../core/RageDetails';
import CrushingBlow from '../../spells/CrushingBlow';
import Bloodbath from '../../spells/Bloodbath';
import SlayerExecute from '../../spells/SlayerExecute';
import MissedRampage from '../../spells/MissedRampage';
import WhirlWind from '../../spells/Whirlwind';
import AlwaysBeCasting from '../AlwaysBeCasting';
import Component from './Component';

class Checklist extends BaseChecklist {
  static dependencies = {
    ...BaseChecklist.dependencies,
    alwaysBeCasting: AlwaysBeCasting,
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    rageDetails: RageDetails,
    rageTracker: RageTracker,
    missedRampage: MissedRampage,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
    whirlWind: WhirlWind,
    crushingBlow: CrushingBlow,
    bloodbath: Bloodbath,
    slayerExecute: SlayerExecute,
  };

  // Core
  protected combatants!: Combatants;
  protected castEfficiency!: CastEfficiency;
  protected preparationRuleAnalyzer!: PreparationRuleAnalyzer;
  protected alwaysBeCasting!: AlwaysBeCasting;

  // Spells
  protected whirlWind!: WhirlWind;
  protected crushingBlow!: CrushingBlow;
  protected bloodbath!: Bloodbath;
  protected slayerExecute!: SlayerExecute;

  // Resources
  protected rageDetails!: RageDetails;
  protected missedRampage!: MissedRampage;

  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,
          rageDetails: this.rageDetails.suggestionThresholds,
          downtimeSuggestionThresholds: this.alwaysBeCasting.downtimeSuggestionThresholds,
          missedRampage: this.missedRampage.suggestionThresholds,
          crushingBlow: this.crushingBlow.suggestionThresholds,
          bloodbath: this.bloodbath.suggestionThresholds,
          slayerExecute: this.slayerExecute.suggestionThresholds,
        }}
      />
    );
  }
}

export default Checklist;
