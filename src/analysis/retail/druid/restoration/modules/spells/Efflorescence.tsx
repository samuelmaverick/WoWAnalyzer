import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellIcon, SpellLink, TooltipElement } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import { ClosedTimePeriod, mergeTimePeriods, OpenTimePeriod } from 'parser/core/mergeTimePeriods';
import UptimeStackBar from 'parser/ui/UptimeStackBar';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';

const DURATION_MS = 30000;
const TICK_MS = 2000;
const EFFLO_TARGETS = 3;
const EFFLO_COLOR = '#881144';
const EFFLO_BG_COLOR = '#cca7a7';

class Efflorescence extends Analyzer {
  /** list of time periods when efflo was active */
  effloUptimes: OpenTimePeriod[] = [];
  /** true iff we've seen at least one Efflo cast */
  hasCast = false;

  /** a chronological listing of timestamps when efflo healed, and how many targets it healed */
  effloTimes: EffloTime[] = [];

  constructor(options: Options) {
    super(options);
    // TODO disable this when player doesn't take talent, or leave active with a message "you should really take Efflo" .. ?
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.EFFLORESCENCE_CAST),
      this.onCast,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.EFFLORESCENCE_HEAL),
      this.onHeal,
    );
  }

  onCast(event: CastEvent) {
    this.hasCast = true;
    this.effloUptimes.push({ start: event.timestamp });
    this.effloTimes.push({ timestamp: event.timestamp, targets: 0, start: true });
  }

  onHeal(event: HealEvent) {
    // only way to detect precasts if by looking for heal events before the first cast
    // assume the efflo lasted until the last detected heal that happens before first cast
    if (!this.hasCast) {
      if (this.effloUptimes.length === 0) {
        this.effloUptimes.push({ start: this.owner.fight.start_time });
        this.effloTimes.push({ timestamp: this.owner.fight.start_time, targets: 0, start: true });
      }
      this.effloUptimes[0].end = event.timestamp;
    }

    // update heal times list
    if (this.effloTimes.length > 0) {
      const latestHeal = this.effloTimes[this.effloTimes.length - 1];
      if (latestHeal.timestamp === event.timestamp) {
        latestHeal.targets += 1;
      } else {
        this.effloTimes.push({ timestamp: event.timestamp, targets: 1 });
      }
    }
  }

  /** Merges adjacent uptimes and 'caps' the end to the current timestamp */
  _mergeAndCapUptimes(): ClosedTimePeriod[] {
    this.effloUptimes.forEach((ut) => {
      if (ut.end === undefined) {
        ut.end = Math.min(ut.start + DURATION_MS, this.owner.currentTimestamp);
      }
    });
    return mergeTimePeriods(this.effloUptimes, this.owner.currentTimestamp);
  }

  /** Builds an artificial uptimes array that extrapolates based on number of targets hit */
  _buildTargetsUptimes(): StackTimePeriod[] {
    const stackTimePeriods: StackTimePeriod[] = [];

    let prev: EffloTime | undefined = undefined;
    this.effloTimes.forEach((et) => {
      if (prev && !et.start) {
        // this is slightly too generous to 'zero ticks' because it reaches back an unhasted tick duration,
        // but it should be close enough that this is preferable to trying to do something more complicated.
        const prevTime = Math.max(prev.timestamp, et.timestamp - TICK_MS);
        stackTimePeriods.push({ start: prevTime, end: et.timestamp, stacks: et.targets });
      }
      prev = et;
    });

    return stackTimePeriods;
  }

  /** An 'uptime' weighted by the number of targets actually being healed, using the StackTimePeriods */
  get weightedUptime() {
    return this._buildTargetsUptimes().reduce(
      (acc, wut) => acc + ((wut.end - wut.start) * wut.stacks) / EFFLO_TARGETS,
      0,
    );
  }

  get weightedUptimePercent() {
    return this.weightedUptime / this.owner.fightDuration;
  }

  get uptime() {
    return this._mergeAndCapUptimes().reduce((acc, ut) => acc + ut.end - ut.start, 0);
  }

  get uptimePercent() {
    return this.uptime / this.owner.fightDuration;
  }

  /** Guide subsection describing the proper usage of Efflorescence */
  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <b>
          <SpellLink spell={SPELLS.EFFLORESCENCE_CAST} />
        </b>{' '}
        is extremely mana efficient if you place it where raiders are standing. Under the boss is
        usually a safe bet. While it's acceptable to let it drop during heavy movement, you should
        otherwise keep it active at all times.
      </p>
    );

    const data = (
      <div>
        <RoundedPanel>
          <strong>Effloresence uptimes</strong>
          {this.subStatistic()}
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  // Custom statistic shows efflo targets hit with bar thickness
  // TODO generalize this if other stacking things want to use it?
  subStatistic() {
    return (
      <div className="flex-main multi-uptime-bar">
        <div className="flex main-bar-big">
          <div className="flex-sub bar-label">
            <SpellIcon
              key={'Icon-' + SPELLS.EFFLORESCENCE_CAST.name}
              spell={SPELLS.EFFLORESCENCE_CAST}
            />{' '}
            <span style={{ color: EFFLO_BG_COLOR }}>
              {formatPercentage(this.uptimePercent, 0)}% <small>active</small>
            </span>
            <br />
            <TooltipElement
              content={`The 'active' percentage considers the times your Effloresence is up,
              while the 'effective' percentage takes into account the number of players it is actually healing`}
            >
              <span style={{ color: EFFLO_COLOR }}>
                {formatPercentage(this.weightedUptimePercent, 0)}% <small>effective</small>
              </span>
            </TooltipElement>
          </div>
          <div className="flex-main chart">
            <UptimeStackBar
              stackUptimeHistory={this._buildTargetsUptimes()}
              start={this.owner.fight.start_time}
              end={this.owner.fight.end_time}
              maxStacks={EFFLO_TARGETS}
              barColor={EFFLO_COLOR}
              backgroundHistory={this._mergeAndCapUptimes()}
              backgroundBarColor={EFFLO_BG_COLOR}
              timeTooltip
            />
          </div>
        </div>
      </div>
    );
  }
}

/**
 * Record of the start of each efflo and also each of its heal ticks.
 * The first tick happens one tick period after the efflo is spawned,
 * and the last tick happens at roughly the same time as the despawn,
 * so when applying time periods for each tick we will extend backwards from when it happened.
 */
interface EffloTime {
  /** The time of this event in milliseconds */
  timestamp: number;
  /** The number of targets hit by this event (or zero for a start event) */
  targets: number;
  /** True iff this event represents the start of an efflo */
  start?: boolean;
}

interface StackTimePeriod {
  /** Timestamp in milliseconds of the time period start */
  start: number;
  /** Timestamp in milliseconds of the time period end */
  end: number;
  /** Number of stacks present during this time period */
  stacks: number;
}

export default Efflorescence;
