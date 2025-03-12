import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyDebuffEvent,
  RefreshDebuffEvent,
  RemoveDebuffEvent,
  CastEvent,
} from 'parser/core/Events';
import SPELLS from 'common/SPELLS/rogue';
import { SpellLink } from 'interface';
import { SpellUse } from 'parser/core/SpellUsage/core';
import { createChecklistItem, createSpellUse } from 'parser/core/MajorCooldowns/MajorCooldown';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { HideGoodCastsSpellUsageSubSection } from 'parser/core/SpellUsage/HideGoodCastsSpellUsageSubSection';
import { logSpellUseEvent } from 'parser/core/SpellUsage/SpellUsageSubSection';
import CastPerformanceSummary from 'analysis/retail/demonhunter/shared/guide/CastPerformanceSummary';
import Enemies from 'parser/shared/modules/Enemies';
import { getRuptureDuration } from 'analysis/retail/rogue/subtlety/constants';

export default class RuptureUptime extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  private cooldownUses: SpellUse[] = [];
  private enemies!: Enemies;
  private lastApplication: CastEvent | null = null;
  private lastRemoval: number | null = null;
  private totalUptime: number = 0;
  private totalFightTime: number = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.RUPTURE),
      this.onApply,
    );
    this.addEventListener(
      Events.refreshdebuff.by(SELECTED_PLAYER).spell(SPELLS.RUPTURE),
      this.onRefresh,
    );
    this.addEventListener(
      Events.removedebuff.by(SELECTED_PLAYER).spell(SPELLS.RUPTURE),
      this.onRemove,
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.RUPTURE), this.onCast);
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <strong>
          <SpellLink spell={SPELLS.RUPTURE} />
        </strong>{' '}
        should be maintained on the target at all times for optimal energy regeneration. Ensure you
        are refreshing it at the right time and not letting it drop.
      </p>
    );

    const goodCasts = this.cooldownUses.filter(
      (it) =>
        it.performance === QualitativePerformance.Good ||
        it.performance === QualitativePerformance.Perfect,
    ).length;
    const totalCasts = this.cooldownUses.length;

    return (
      <HideGoodCastsSpellUsageSubSection
        hideGoodCasts={false}
        explanation={explanation}
        uses={this.cooldownUses}
        castBreakdownSmallText={<> - Red indicates a wasted or missed Rupture.</>}
        onPerformanceBoxClick={logSpellUseEvent}
        abovePerformanceDetails={
          <div style={{ marginBottom: 10 }}>
            <CastPerformanceSummary
              spell={SPELLS.RUPTURE}
              casts={goodCasts}
              performance={
                this.cooldownUses.length > 0
                  ? this.cooldownUses[0].performance
                  : QualitativePerformance.Fail
              }
              totalCasts={totalCasts}
            />
          </div>
        }
        noCastsTexts={{
          noCastsOverride: 'No Rupture casts detected! This is a major issue.',
        }}
      />
    );
  }

  private onCast(event: CastEvent) {
    this.lastApplication = event;
  }

  private onApply(event: ApplyDebuffEvent) {
    this.evaluatePerformance(event, 'apply');
  }

  private onRefresh(event: RefreshDebuffEvent) {
    this.lastApplication = event as any;
    this.evaluatePerformance(event, 'refresh');
  }

  private onRemove(event: RemoveDebuffEvent) {
    this.lastRemoval = event.timestamp;
  }

  private evaluatePerformance(
    event: ApplyDebuffEvent | RefreshDebuffEvent,
    type: 'apply' | 'refresh',
  ) {
    const uptimePercentage = this.getRuptureUptimePercentage();
    const refreshedTooEarly =
      this.lastApplication &&
      event.timestamp - this.lastApplication.timestamp <
        getRuptureDuration(this.selectedCombatant, this.lastApplication) * 0.3;

    let performance: QualitativePerformance;
    let summary: JSX.Element;
    let details: JSX.Element;

    if (uptimePercentage >= 90 && !refreshedTooEarly) {
      performance = QualitativePerformance.Perfect;
      summary = <div>Perfect Rupture Management</div>;
      details = (
        <div>
          Your <SpellLink spell={SPELLS.RUPTURE} /> uptime was excellent with no significant gaps or
          premature refreshes.
        </div>
      );
    } else if (uptimePercentage >= 70) {
      performance = QualitativePerformance.Good;
      summary = <div>Good Rupture Uptime</div>;
      details = (
        <div>
          Your <SpellLink spell={SPELLS.RUPTURE} /> uptime was solid, but there were minor gaps or
          early refreshes.
        </div>
      );
    } else {
      performance = QualitativePerformance.Fail;
      summary = <div>Poor Rupture Uptime</div>;
      details = (
        <div>
          Your <SpellLink spell={SPELLS.RUPTURE} /> uptime was low, or you refreshed too early.
          Ensure Rupture remains active and refresh at the optimal time.
        </div>
      );
    }

    this.cooldownUses.push(
      createSpellUse({ event }, [
        createChecklistItem('rupture_management', { event }, { performance, summary, details }),
      ]),
    );
  }

  private getRuptureUptimePercentage(): number {
    this.totalUptime = this.enemies.getBuffUptime(SPELLS.RUPTURE.id);
    this.totalFightTime = this.owner.fight.end_time - this.owner.fight.start_time;
    return (this.totalUptime / this.totalFightTime) * 100;
  }
}
