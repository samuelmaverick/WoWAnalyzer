import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';
import { getCurrentRSKTalent } from '../../constants';
import { Talent } from 'common/TALENTS/types';
import { formatPercentage } from 'common/format';

const CAST_BUFFER_MS = 250;

class RisingSunKick extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  lastBOK: number = Number.MIN_SAFE_INTEGER;
  lastRSK: number = Number.MIN_SAFE_INTEGER;
  lastRSKTFT = false;
  rskResets = 0;
  currentRskTalent: Talent;

  constructor(options: Options) {
    super(options);
    this.currentRskTalent = getCurrentRSKTalent(this.selectedCombatant);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(this.currentRskTalent),
      this.risingSunKickCast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.BLACKOUT_KICK),
      this.blackoutKickCast,
    );
  }

  risingSunKickCast(event: CastEvent) {
    // we are fine. Regular cast
    if (!this.spellUsable.isOnCooldown(this.currentRskTalent.id)) {
      this.lastRSK = event.timestamp;
      return;
    }
    if (
      this.selectedCombatant.hasBuff(
        TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT.id,
        event.timestamp,
        CAST_BUFFER_MS,
      )
    ) {
      //reduces the cooldown of TFT by '9s' via tooltip but is really reduced by 6 gcds
      const cdr = event.globalCooldown ? event.globalCooldown.duration * 6 : 9000;
      this.lastRSKTFT = true;
      this.spellUsable.reduceCooldown(this.currentRskTalent.id, cdr);
    } else {
      this.lastRSKTFT = false;
    }
    if (!this.lastRSKTFT && this.lastBOK > this.lastRSK) {
      this.rskResets += 1;
    }

    this.lastRSK = event.timestamp;
  }

  blackoutKickCast(event: CastEvent) {
    this.lastBOK = event.timestamp;
  }

  /** Guide subsection describing the proper usage of RSK */
  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <b>
          <SpellLink spell={this.currentRskTalent} />
        </b>{' '}
        is one of your primary damaging spells but is also you highest priority healing spell{' '}
        {'(alongside '} <SpellLink spell={TALENTS_MONK.RENEWING_MIST_TALENT} />
        {') '}due to its synergy with <SpellLink spell={TALENTS_MONK.RISING_MIST_TALENT} />{' '}
        {this.selectedCombatant.hasTalent(TALENTS_MONK.POOL_OF_MISTS_TALENT) && (
          <>
            , <SpellLink spell={TALENTS_MONK.POOL_OF_MISTS_TALENT} />,{' '}
          </>
        )}
        and <SpellLink spell={TALENTS_MONK.RAPID_DIFFUSION_TALENT} />. Using it as much as possible
        is essential for maintaining high counts of{' '}
        <SpellLink spell={TALENTS_MONK.RENEWING_MIST_TALENT} />
      </p>
    );

    const data = (
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink spell={this.currentRskTalent} /> cast efficiency
          </strong>
          {this.guideSubStatistic()}
          {this.rwkUptime()}
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  rwkUptime() {
    if (!this.selectedCombatant.hasTalent(TALENTS_MONK.RUSHING_WIND_KICK_TALENT)) {
      return <></>;
    }

    return (
      <>
        <div style={{ fontSize: 20 }}>
          {formatPercentage(
            this.selectedCombatant.getBuffUptime(SPELLS.RUSHING_WINDS_BUFF) /
              this.owner.fightDuration,
          )}
          % <small> buff uptime</small>
        </div>
      </>
    );
  }

  /** Guide subsection describing the proper usage of Rejuvenation */
  guideSubStatistic() {
    return (
      <CastEfficiencyBar
        spellId={this.currentRskTalent.id}
        gapHighlightMode={GapHighlight.FullCooldown}
        minimizeIcons
        slimLines
        useThresholds
      />
    );
  }

  subStatistic() {
    return (
      <>
        {this.rskResets} <small>resets</small>
      </>
    );
  }
}

export default RisingSunKick;
