import { Trans } from '@lingui/react/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellIcon } from 'interface';
import PlusIcon from 'interface/icons/Plus';
import UpArrowIcon from 'interface/icons/UpArrow';
import Analyzer from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import { BEACON_TRANSFERING_ABILITIES } from '../../constants';
import PaladinAbilityTracker from '../core/PaladinAbilityTracker';
import Abilities from '../features/Abilities';

class DirectBeaconHealing extends Analyzer {
  static dependencies = {
    abilityTracker: PaladinAbilityTracker,
    abilities: Abilities,
  };

  protected abilityTracker!: PaladinAbilityTracker;
  protected abilities!: Abilities;

  get beaconTransferingAbilities() {
    const listOfSpells: number[] = [];

    //This might seem like a way but ability.spell can be an array
    //meaning we can miss a few spells *cough* holy shock. We don't want that so yeah
    this.abilities.activeAbilities.forEach((ability) => {
      if (Array.isArray(ability.spell)) {
        ability.spell.forEach((oneSpell) => {
          if (BEACON_TRANSFERING_ABILITIES[oneSpell]) {
            listOfSpells.push(oneSpell);
          }
        });
      } else {
        if (BEACON_TRANSFERING_ABILITIES[ability.spell]) {
          listOfSpells.push(ability.spell);
        }
      }
    });

    return listOfSpells;
  }
  get totalFoLHLOnBeaconPercentage() {
    const abilityTracker = this.abilityTracker;
    const getCastCount = (spellId: number) => abilityTracker.getAbility(spellId);

    let casts = 0;
    let castsOnBeacon = 0;

    this.beaconTransferingAbilities
      .filter((ability) => [SPELLS.FLASH_OF_LIGHT.id, SPELLS.HOLY_LIGHT.id].includes(ability))
      .forEach((ability) => {
        const castCount = getCastCount(ability);
        casts += castCount.healingHits || 0;
        castsOnBeacon += castCount.healingBeaconHits || 0;
      });

    return castsOnBeacon / casts;
  }
  get totalOtherSpellsOnBeaconPercentage() {
    const abilityTracker = this.abilityTracker;
    const getCastCount = (spellId: number) => abilityTracker.getAbility(spellId);

    let casts = 0;
    let castsOnBeacon = 0;

    this.beaconTransferingAbilities
      .filter((ability) => ![SPELLS.FLASH_OF_LIGHT.id, SPELLS.HOLY_LIGHT.id].includes(ability))
      .forEach((ability) => {
        const castCount = getCastCount(ability);
        casts += castCount.healingHits || 0;
        castsOnBeacon += castCount.healingBeaconHits || 0;
      });

    return castsOnBeacon / casts;
  }
  get totalHealsOnBeaconPercentage() {
    const abilityTracker = this.abilityTracker;
    const getCastCount = (spellId: number) => abilityTracker.getAbility(spellId);

    let casts = 0;
    let castsOnBeacon = 0;

    this.beaconTransferingAbilities.forEach((ability) => {
      const castCount = getCastCount(ability);
      casts += castCount.healingHits || 0;
      castsOnBeacon += castCount.healingBeaconHits || 0;
    });

    return castsOnBeacon / casts;
  }

  get suggestionThresholds() {
    return {
      actual: this.totalHealsOnBeaconPercentage,
      isGreaterThan: {
        minor: 0.2,
        average: 0.25,
        major: 0.35,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }
  suggestions(when: When) {
    when(this.suggestionThresholds.actual)
      .isGreaterThan(this.suggestionThresholds.isGreaterThan.minor)
      .addSuggestion((suggest, actual, recommended) =>
        suggest(
          <Trans id="paladin.holy.modules.beacons.directBeaconHealing.suggestion">
            You cast a lot of direct heals on beacon targets. Direct healing beacon targets is
            inefficient. Try to only cast on beacon targets when they would otherwise die.
          </Trans>,
        )
          .icon('ability_paladin_beaconoflight')
          .actual(
            <Trans id="paladin.holy.modules.beacons.directBeaconHealing.actual">
              {formatPercentage(actual)}% of all your healing spell casts were on a beacon target
            </Trans>,
          )
          .recommended(
            <Trans id="paladin.holy.modules.beacons.directBeaconHealing.recommended">
              &lt;{formatPercentage(recommended)}% is recommended
            </Trans>,
          )
          .regular(this.suggestionThresholds.isGreaterThan.average)
          .major(this.suggestionThresholds.isGreaterThan.major),
      );
  }
  statistic() {
    return (
      <Statistic position={STATISTIC_ORDER.CORE(50)} size="small">
        <div className="pad">
          <div className="pull-right">
            <PlusIcon /> <UpArrowIcon style={{ transform: 'rotate(90deg)' }} />{' '}
            <SpellIcon spell={SPELLS.BEACON_OF_LIGHT_CAST_AND_BUFF} />
          </div>
          <label>
            <Trans id="paladin.holy.modules.beacons.directBeaconHealing.directBeaconHealing">
              Direct beacon healing
            </Trans>
          </label>

          <div className="flex" style={{ marginTop: -10 }}>
            <div className="flex-main value" style={{ marginRight: 15 }}>
              {formatPercentage(this.totalHealsOnBeaconPercentage, 0)}%
            </div>
            <div className="flex-main">
              <div className="flex pull-right text-center" style={{ whiteSpace: 'nowrap' }}>
                <div className="flex-main" style={{ marginRight: 15 }}>
                  <small>
                    <Trans id="paladin.holy.modules.beacons.directBeaconHealing.hlFol">
                      HL/FoL
                    </Trans>
                  </small>
                  <div className="value" style={{ fontSize: '1em' }}>
                    {formatPercentage(this.totalFoLHLOnBeaconPercentage, 0)}%
                  </div>
                </div>
                <div className="flex-main">
                  <small>
                    <Trans id="paladin.holy.modules.beacons.directBeaconHealing.otherSpells">
                      Other spells
                    </Trans>
                  </small>
                  <div className="value" style={{ fontSize: '1em' }}>
                    {formatPercentage(this.totalOtherSpellsOnBeaconPercentage, 0)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Statistic>
    );
  }
}

export default DirectBeaconHealing;
