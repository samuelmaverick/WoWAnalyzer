import { change, date } from 'common/changelog';
import { Sref } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';
import { TALENTS_DRUID } from 'common/TALENTS/druid';
import SPELLS from 'common/SPELLS';

export default [
  change(date(2025, 3, 16), <>Added statistic for <SpellLink spell={TALENTS_DRUID.MERCILESS_CLAWS_TALENT} /></>, Sref),
  change(date(2025, 3, 4), <>Marked as updated for 11.1.0.</>, Sref),
  change(date(2025, 2, 16), <>Added support for the Liberation of Undermine tier set.</>, Sref),
  change(date(2025, 1, 20), <>Fixed an issue where <SpellLink spell={SPELLS.RAKE_BLEED}/> bleed and <SpellLink spell={SPELLS.DREADFUL_WOUND}/> damage was not being counted in <SpellLink spell={TALENTS_DRUID.ADAPTIVE_SWARM_TALENT}/> boost</>, Sref),
  change(date(2024, 10, 27), <>Updated patch compatibility to 11.0.5.</>, Sref),
  change(date(2024, 9, 13), <>Updated guide text to indicate finishes should always be used with 5 CPs. Fixed a typo in Rip cast breakdown.</>, Sref),
  change(date(2024, 8, 22), <><SpellLink spell={TALENTS_DRUID.CONVOKE_THE_SPIRITS_TALENT}/> tracker should now correctly detect procced <SpellLink spell={TALENTS_DRUID.RAVAGE_TALENT}/> casts.</>, Sref),
  change(date(2024, 8, 22), <>Cleaner display of <SpellLink spell={SPELLS.RAKE}/>, <SpellLink spell={SPELLS.RIP}/>, <SpellLink spell={SPELLS.FEROCIOUS_BITE}/>, and <SpellLink spell={TALENTS_DRUID.SUDDEN_AMBUSH_TALENT}/> sections in Guide.</>, Sref),
  change(date(2024, 8, 17), <>Marked updated for 11.0.2 and updated the spec's 'About' page.</>, Sref),
  change(date(2024, 8, 14), <>Updated spells to account for 11.0.2 balance patch.</>, Sref),
  change(date(2024, 7, 22), <>Refactored various modules to correctly handle <SpellLink spell={TALENTS_DRUID.RAVAGE_TALENT}/>. More updates for The War Within talent changes.</>, Sref),
  change(date(2024, 7, 14), <>Activating Feral Druid analyzer for The War Within! Hero talent analyzers not yet implemented.</>, Sref),
];
