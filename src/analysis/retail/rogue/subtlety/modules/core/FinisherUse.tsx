import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { BadColor, GoodColor, OkColor } from 'interface/guide';
import { ResourceLink } from 'interface';
import DonutChart from 'parser/ui/DonutChart';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import getResourceSpent from 'parser/core/getResourceSpent';
import SPELLS from 'common/SPELLS/rogue';
import TALENTS from 'common/TALENTS/rogue';
import { formatDurationMillisMinSec } from 'common/format';

import { getTargetComboPoints, isInOpener, OPENER_MAX_DURATION_MS } from '../../constants';

export default class FinisherUse extends Analyzer {
  totalFinisherCasts = 0;
  lowCpFinisherCasts = 0;
  openerLowCpFinisherCasts = 0;

  constructor(options: Options) {
    super(options);

    const trackedFinishers = [SPELLS.EVISCERATE];

    if (this.selectedCombatant.hasTalent(TALENTS.SECRET_TECHNIQUE_TALENT)) {
      trackedFinishers.push(TALENTS.SECRET_TECHNIQUE_TALENT);
    }

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(trackedFinishers), this.onCast);
  }

  get maxCpFinishers() {
    return this.totalFinisherCasts - this.lowCpFinisherCasts - this.openerLowCpFinisherCasts;
  }

  get chart() {
    const items = [
      {
        color: GoodColor,
        label: 'Max CP Finishers',
        value: this.maxCpFinishers,
        tooltip: (
          <>This includes finishers cast at {getTargetComboPoints(this.selectedCombatant)}+ CPs.</>
        ),
      },
      {
        color: OkColor,
        label: 'Low CP Opener Finishers',
        value: this.openerLowCpFinisherCasts,
        tooltip: (
          <>
            This includes low CP finisher casts in the first{' '}
            {formatDurationMillisMinSec(OPENER_MAX_DURATION_MS)} of an encounter.
          </>
        ),
      },
      {
        color: BadColor,
        label: 'Low CP Finishers',
        value: this.lowCpFinisherCasts,
      },
    ];

    return <DonutChart items={items} />;
  }

  statistic() {
    return (
      <Statistic position={STATISTIC_ORDER.CORE(6)}>
        <div className="pad">
          <label>
            <ResourceLink id={RESOURCE_TYPES.COMBO_POINTS.id} /> spender usage
          </label>
          {this.chart}
        </div>
      </Statistic>
    );
  }

  private onCast(event: CastEvent) {
    const cpsSpent = getResourceSpent(event, RESOURCE_TYPES.COMBO_POINTS);
    if (cpsSpent === 0) {
      return;
    }

    this.totalFinisherCasts += 1;
    if (cpsSpent < getTargetComboPoints(this.selectedCombatant)) {
      if (isInOpener(event, this.owner.fight)) {
        this.openerLowCpFinisherCasts += 1;
      } else {
        this.lowCpFinisherCasts += 1;
      }
    }
  }
}
