import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/rogue';
import SPELLS from 'common/SPELLS/rogue';
import EnergyTracker from 'analysis/retail/rogue/shared/EnergyTracker';
import { SpellUse } from 'parser/core/SpellUsage/core';
import Events, { CastEvent } from 'parser/core/Events';
import { getResourceChange } from 'analysis/retail/rogue/shared/talents/ThistleTeaCastLinkNormalizer';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { isInOpener } from 'analysis/retail/rogue/assassination/constants';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import ResourceLink from 'interface/ResourceLink';
import SpellLink from 'interface/SpellLink';
import { RoundedPanel, SideBySidePanels } from 'interface/guide/components/GuideDivs';
import ContextualSpellUsageSubSection from 'parser/core/SpellUsage/HideGoodCastsSpellUsageSubSection';

export default class ThistleTea extends Analyzer {
  static dependencies = {
    energyTracker: EnergyTracker,
  };

  cooldownUses: SpellUse[] = [];

  protected energyTracker!: EnergyTracker;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.THISTLE_TEA_TALENT);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), (event: CastEvent) => {
      if (event.ability.guid === SPELLS.THISTLE_TEA.id) {
        this.onCast(event);
      }
    });
  }

  get guideSubsection(): JSX.Element {
    const wasted = this.energyTracker.getWastedBySpell(SPELLS.THISTLE_TEA.id);
    const generated = this.energyTracker.getGeneratedBySpell(SPELLS.THISTLE_TEA.id);

    const explanation = (
      <p>
        <strong>
          <SpellLink spell={SPELLS.THISTLE_TEA} />
        </strong>{' '}
        is used to generate 100 <ResourceLink id={RESOURCE_TYPES.ENERGY.id} />. It should be used
        during your opener to get it on cooldown and then whenever you need energy.
      </p>
    );

    return (
      <ContextualSpellUsageSubSection
        explanation={explanation}
        uses={this.cooldownUses}
        abovePerformanceDetails={
          <SideBySidePanels>
            <RoundedPanel>
              <div>
                Generated {generated} <ResourceLink id={RESOURCE_TYPES.ENERGY.id} />
              </div>
            </RoundedPanel>
            <RoundedPanel>
              <div>
                Wasted {wasted} <ResourceLink id={RESOURCE_TYPES.ENERGY.id} />
              </div>
            </RoundedPanel>
          </SideBySidePanels>
        }
        castBreakdownSmallText={
          <> - Green is a good cast, Yellow is an ok cast, Red is a bad cast.</>
        }
      />
    );
  }

  private onCast(event: CastEvent) {
    const resourceChange = getResourceChange(event);
    if (!resourceChange) {
      return; // if we don't have an associated resource change, something's wrong, so ignore it atm
    }

    const energyChange = resourceChange.classResources.find(
      (resource) => resource.type === RESOURCE_TYPES.ENERGY.id,
    );
    if (!energyChange) {
      return; // we didn't get energy from the cast
    }

    const wasted = resourceChange.waste;
    const gained = resourceChange.resourceChange - resourceChange.waste;

    let performance = QualitativePerformance.Good;
    const summary = (
      <div>
        Get 100 <ResourceLink id={RESOURCE_TYPES.ENERGY.id} /> from cast
      </div>
    );
    let details = (
      <div>
        You got {gained} <ResourceLink id={RESOURCE_TYPES.ENERGY.id} /> from this cast.
      </div>
    );
    if (wasted > 0) {
      if (isInOpener(event, this.owner.fight)) {
        performance = QualitativePerformance.Ok;
        details = (
          <div>
            You wasted {wasted} <ResourceLink id={RESOURCE_TYPES.ENERGY.id} /> from this cast. It's
            okay because it's part of your opener.
          </div>
        );
      } else if (wasted <= 10) {
        performance = QualitativePerformance.Ok;
        details = (
          <div>
            You wasted {wasted} <ResourceLink id={RESOURCE_TYPES.ENERGY.id} /> from this cast. The
            wasted energy in this case is fairly small, but can be improved.
          </div>
        );
      } else {
        performance = QualitativePerformance.Fail;
        details = (
          <div>
            You wasted {wasted} <ResourceLink id={RESOURCE_TYPES.ENERGY.id} /> from this cast. Try
            not to waste any energy when casting <SpellLink spell={TALENTS.THISTLE_TEA_TALENT} />.
          </div>
        );
      }
    }

    this.cooldownUses.push({
      event,
      performance: performance,
      checklistItems: [
        {
          check: 'energy-waste',
          timestamp: event.timestamp,
          performance: performance,
          summary,
          details,
        },
      ],
      performanceExplanation:
        performance !== QualitativePerformance.Fail ? `${performance} Usage` : 'Bad Usage',
    });
  }
}
