import { GuideProps, Section, SubSection, useAnalyzer, useInfo } from 'interface/guide';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import TALENTS from 'common/TALENTS/shaman';
import SPELLS from 'common/SPELLS/shaman';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import CombatLogParser from 'analysis/retail/shaman/enhancement/CombatLogParser';
import { Cooldown } from 'interface/guide/components/CooldownGraphSubSection';

interface Props {
  checklist: Cooldown[];
}

const COOLDOWNS: Cooldown[] = [
  {
    spell: TALENTS.FERAL_SPIRIT_TALENT,
    isActive: (c) =>
      c.hasTalent(TALENTS.FERAL_SPIRIT_TALENT) && !c.hasTalent(TALENTS.FLOWING_SPIRITS_TALENT),
  },
  {
    spell: TALENTS.DOOM_WINDS_TALENT,
    isActive: (c) => c.hasTalent(TALENTS.DOOM_WINDS_TALENT),
  },
  {
    spell: TALENTS.PRIMORDIAL_WAVE_TALENT,
    isActive: (c) => c.hasTalent(TALENTS.PRIMORDIAL_WAVE_TALENT),
  },
  {
    spell: TALENTS.ASCENDANCE_ENHANCEMENT_TALENT,
    isActive: (c) => c.hasTalent(TALENTS.ASCENDANCE_ENHANCEMENT_TALENT),
  },
  {
    spell: SPELLS.SURGING_TOTEM,
    isActive: (c) => c.hasTalent(TALENTS.SURGING_TOTEM_TALENT),
  },
];

function Cooldowns({ info, modules, events }: GuideProps<typeof CombatLogParser>) {
  return (
    <Section title="Core">
      {modules.ascendance.guideSubsection}
      {modules.hotHand.guideSubsection}
      {modules.elementalBlastGuide.guideSubsection}
      {modules.primordialStorm.guideSubsection}
      {modules.legacyOfTheFrostWitch.guideSubsection}
      <SubSection title="Cooldowns">
        <p>
          <strong>Cooldowns</strong> - this graph shows when you used your major cooldowns and how
          long you waited to use them again. Unless you're holding these for specific raid events,
          try to use these on as soon as they become available.
        </p>
        <CooldownGraphSubsection checklist={COOLDOWNS} />
      </SubSection>
    </Section>
  );
}

const CooldownGraphSubsection = ({ checklist }: Props) => {
  const info = useInfo();
  const castEfficiency = useAnalyzer(CastEfficiency);
  if (!info || !castEfficiency) {
    return null;
  }

  return (
    <SubSection>
      {checklist
        .filter((cooldown) => cooldown.isActive && cooldown.isActive(info.combatant))
        .map((cooldown) => (
          <CastEfficiencyBar
            key={cooldown.spell.id}
            spell={cooldown.spell}
            gapHighlightMode={GapHighlight.All}
            minimizeIcons={
              (castEfficiency.getCastEfficiencyForSpell(cooldown.spell)?.casts ?? 0) > 10
            }
            useThresholds
          />
        ))}
    </SubSection>
  );
};

export default Cooldowns;
