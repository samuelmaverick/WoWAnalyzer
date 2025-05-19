import { formatMilliseconds, formatNumber, formatPercentage } from 'common/format';
import CrossIcon from 'interface/icons/Cross';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import CASTABLE_WHILE_CASTING_SPELLS from 'parser/core/CASTABLE_WHILE_CASTING_SPELLS';
import CASTS_THAT_ARENT_CASTS from 'parser/core/CASTS_THAT_ARENT_CASTS';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import BoringValueText from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import Events, {
  CastEvent,
  BeginCastEvent,
  EmpowerStartEvent,
  EmpowerEndEvent,
  EventType,
} from '../../core/Events';
import { Suggestion } from 'parser/core/CombatLogParser';

const debug = false;
const MS_BUFFER = 100;

class CancelledCasts extends Analyzer {
  castsCancelled = 0;
  castsFinished = 0;
  beginCastSpell: BeginCastEvent | EmpowerStartEvent | undefined = undefined;
  wasCastStarted = false;
  cancelledSpellList: Record<
    number,
    {
      spellName: string;
      amount: number;
    }
  > = {};

  cancelGaps: CancelGap[] = [];
  IGNORED_ABILITIES: number[] = [];

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.begincast.by(SELECTED_PLAYER), this.onBeginCast);
    this.addEventListener(Events.empowerStart.by(SELECTED_PLAYER), this.onBeginCast);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
    this.addEventListener(Events.empowerEnd.by(SELECTED_PLAYER), this.onCast);
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  onBeginCast(event: BeginCastEvent | EmpowerStartEvent) {
    const spellId = event.ability.guid;
    if (
      this.IGNORED_ABILITIES.includes(spellId) ||
      CASTS_THAT_ARENT_CASTS.includes(spellId) ||
      CASTABLE_WHILE_CASTING_SPELLS.includes(spellId)
    ) {
      return;
    }
    if (
      this.wasCastStarted &&
      this.beginCastSpell !== undefined &&
      event.timestamp - this.beginCastSpell.timestamp > MS_BUFFER
    ) {
      this.castsCancelled += 1;
      this.addToCancelledList(event.timestamp);
    }
    this.beginCastSpell = event;
    this.wasCastStarted = true;
  }

  onCast(event: CastEvent | EmpowerEndEvent) {
    const spellId = event.ability.guid;
    const beginCastAbility = this.beginCastSpell && this.beginCastSpell.ability;
    if (
      this.IGNORED_ABILITIES.includes(spellId) ||
      CASTS_THAT_ARENT_CASTS.includes(spellId) ||
      CASTABLE_WHILE_CASTING_SPELLS.includes(spellId) ||
      !beginCastAbility
    ) {
      return;
    }
    if (
      this.beginCastSpell?.type === EventType.EmpowerStart &&
      event.type !== EventType.EmpowerEnd
    ) {
      return;
    }
    if (beginCastAbility.guid !== spellId && this.wasCastStarted) {
      this.castsCancelled += 1;
      this.addToCancelledList(event.timestamp);
    }
    if (beginCastAbility.guid === spellId && this.wasCastStarted) {
      this.castsFinished += 1;
    }
    this.wasCastStarted = false;
  }

  addToCancelledList(timestamp: number) {
    if (!this.beginCastSpell) {
      return;
    }
    const beginCastAbility = this.beginCastSpell.ability;
    if (!this.cancelledSpellList[beginCastAbility.guid]) {
      this.cancelledSpellList[beginCastAbility.guid] = {
        spellName: beginCastAbility.name,
        amount: 1,
      };
    } else {
      this.cancelledSpellList[beginCastAbility.guid].amount += 1;
    }
    debug && this.log(beginCastAbility.name + ' cast cancelled');

    const endTimestamp = Math.min(timestamp, this.beginCastSpell.timestamp + MAX_CAST_TIME_GUESS);

    this.cancelGaps.push({
      start: this.beginCastSpell.timestamp,
      end: endTimestamp,
      abilityId: beginCastAbility.guid,
      capped: endTimestamp - this.beginCastSpell.timestamp >= MAX_CAST_TIME_GUESS,
    });
  }
  get totalCasts() {
    return this.castsCancelled + this.castsFinished;
  }

  get cancelledPercentage() {
    return this.castsCancelled / this.totalCasts;
  }

  get cancelledCastSuggestionThresholds() {
    return {
      actual: this.cancelledPercentage,
      isGreaterThan: {
        minor: 0.02,
        average: 0.05,
        major: 0.15,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get CancelledPerformance(): QualitativePerformance {
    const cancel = this.cancelledPercentage;
    const suggestionThresholds = this.cancelledCastSuggestionThresholds.isGreaterThan;
    if (cancel <= 0.01) {
      return QualitativePerformance.Perfect;
    }
    if (cancel <= suggestionThresholds.minor) {
      return QualitativePerformance.Good;
    }
    if (cancel <= suggestionThresholds.average) {
      return QualitativePerformance.Ok;
    }
    return QualitativePerformance.Fail;
  }

  onFightEnd() {
    debug &&
      console.log(
        formatMilliseconds(this.owner.fightDuration),
        'Casts Finished:',
        `${formatNumber(this.castsFinished)}`,
      );
    debug &&
      console.log(
        formatMilliseconds(this.owner.fightDuration),
        'Casts Cancelled:',
        `${formatNumber(this.castsCancelled)}`,
      );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(10)}
        size="small"
        className="value"
        tooltip={
          <>
            You cast {this.totalCasts} spells.
            <ul>
              <li>{this.castsFinished} casts were completed</li>
              <li>{this.castsCancelled} casts were cancelled</li>
            </ul>
          </>
        }
      >
        <BoringValueText label="Cancelled Casts">
          <CrossIcon /> {formatPercentage(this.cancelledPercentage)}% <small>Casts Cancelled</small>
        </BoringValueText>
      </Statistic>
    );
  }

  suggestions(when: When): void | Suggestion[] {
    when(this.cancelledCastSuggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You are cancelling a large percentage of your casts. While casting the wrong spell is
          worse than casting the right one, it is often better than casting nothing!
        </>,
      )
        .icon('ability_kick')
        .actual(<>{formatPercentage(actual)}% of casts cancelled</>)
        .recommended(<>&lt; {formatPercentage(recommended)}% is recommended</>),
    );
  }
}

export default CancelledCasts;

export interface CancelGap {
  start: number;
  end: number;
  abilityId: number;
  /**
   * Whether the max cast time for guesses was used to cap the gap time.
   */
  capped: boolean;
}

const MAX_CAST_TIME_GUESS = 2000;
