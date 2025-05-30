import { change, date } from 'common/changelog';
import { Trevor, Harrek, Hana, KYZ, Capybara, Vollmer} from 'CONTRIBUTORS';
import { SpellLink } from 'interface';
import { TALENTS_EVOKER } from 'common/TALENTS';

// prettier-ignore
export default [
  change(date(2025, 3, 25), <>Implement <SpellLink spell={TALENTS_EVOKER.FLAME_SIPHON_TALENT}/> module</>, Vollmer),
  change(date(2025, 3, 18), <>DB no longer counts non-player targets </>, Capybara),
  change(date(2025, 3, 18), <>Updated DB target count for 6+ targets </>, Capybara),
  change(date(2025, 3, 2), <>Bump to 11.1.0</>, Harrek),
  change(date(2025, 3, 2), <>Implemented T33 Tierset module</>, Harrek),
  change(date(2025, 1, 16),  <>Implement <SpellLink spell={TALENTS_EVOKER.TIME_SPIRAL_TALENT}/>, <SpellLink spell={TALENTS_EVOKER.TIME_CONVERGENCE_TALENT}/>, <SpellLink spell={TALENTS_EVOKER.MASTER_OF_DESTINY_TALENT}/>, and <SpellLink spell={TALENTS_EVOKER.MOTES_OF_ACCELERATION_TALENT}/> modules</>, KYZ),
  change(date(2024, 12, 27), <>Implement <SpellLink spell={TALENTS_EVOKER.PRIMACY_TALENT}/> module</>, KYZ),
  change(date(2024, 10, 28), <>Updated <SpellLink spell={TALENTS_EVOKER.SPIRITBLOOM_TALENT} /> guide section</>, Harrek),
  change(date(2024, 10, 24), <>Update <SpellLink spell={TALENTS_EVOKER.LIFEBIND_TALENT}/> module</>, Harrek),
  change(date(2024, 10, 24), <>Bump to 11.0.5</>, Trevor),
  change(date(2024, 10, 23), <>Improve <SpellLink spell={TALENTS_EVOKER.CONSUME_FLAME_TALENT}/> module</>, Trevor),
  change(date(2024, 9, 30), <>Update <SpellLink spell={TALENTS_EVOKER.CONSUME_FLAME_TALENT}/> wording</>, Trevor),
  change(date(2024, 9, 28), <>Update <SpellLink spell={TALENTS_EVOKER.STASIS_TALENT}/> for Flameshaper</>, Trevor),
  change(date(2024, 9, 28), <>Improve <SpellLink spell={TALENTS_EVOKER.CONSUME_FLAME_TALENT}/> guide section</>, Trevor),
  change(date(2024, 9, 28), <>Add <SpellLink spell={TALENTS_EVOKER.CONSUME_FLAME_TALENT}/> to guide section</>, Hana),
  change(date(2024, 9, 21), <>Update <SpellLink spell={TALENTS_EVOKER.LEAPING_FLAMES_TALENT}/> to work with <SpellLink spell={TALENTS_EVOKER.CHRONO_FLAME_TALENT}/></>, Harrek),
  change(date(2024, 9, 14), <>Update <SpellLink spell={TALENTS_EVOKER.SOURCE_OF_MAGIC_TALENT}/> for TWW</>, Trevor),
  change(date(2024, 9, 14), <>Add <SpellLink spell={TALENTS_EVOKER.ENGULF_TALENT}/> to Stasis spells</>, Trevor),
  change(date(2024, 8, 22), <>Bumped Preservation to full support for 11.0.2</>, Harrek),
  change(date(2024, 8, 22), <>Temporarily disabled <SpellLink spell={TALENTS_EVOKER.TITANS_GIFT_TALENT} /> module</>, Harrek),
  change(date(2024, 7, 23), <>Rework T32 tier set module</>, Harrek),
  change(date(2024, 7, 2),  <>Add <SpellLink spell={TALENTS_EVOKER.REVERBERATIONS_TALENT}/>, <SpellLink spell={TALENTS_EVOKER.CHRONO_FLAME_TALENT}/>, <SpellLink spell={TALENTS_EVOKER.THREADS_OF_FATE_TALENT}/> and <SpellLink spell={TALENTS_EVOKER.DOUBLE_TIME_TALENT}/> modules</>, Harrek),
  change(date(2024, 6, 22), <>Add <SpellLink spell={TALENTS_EVOKER.RED_HOT_TALENT} /> module</>, Trevor),
  change(date(2024, 6, 20), <>Integrate <SpellLink spell={TALENTS_EVOKER.CONSUME_FLAME_TALENT}/> into <SpellLink spell={TALENTS_EVOKER.EXPANDED_LUNGS_TALENT}/> module</>, Trevor),
  change(date(2024, 6, 20), <>Add <SpellLink spell={TALENTS_EVOKER.TITANS_GIFT_TALENT} /> module</>, Harrek),
  change(date(2024, 6, 20), <>Update <SpellLink spell={TALENTS_EVOKER.CYCLE_OF_LIFE_TALENT}/> spells for Flameshaper</>, Trevor),
  change(date(2024, 6, 19), <>Add Fan The Flames module</>, Trevor),
  change(date(2024, 6, 19), <>Add <SpellLink spell={TALENTS_EVOKER.ENGULF_TALENT}/> to <SpellLink spell={TALENTS_EVOKER.ECHO_TALENT}/> modules</>, Trevor),
  change(date(2024, 6, 19), <>Implement <SpellLink spell={TALENTS_EVOKER.EXPANDED_LUNGS_TALENT}/> module</>, Trevor),
  change(date(2024, 6, 19), <>Remove <SpellLink spell={TALENTS_EVOKER.REWIND_TALENT}/> from <SpellLink spell={TALENTS_EVOKER.ENGULF_TALENT}/> module</>, Trevor),
  change(date(2024, 6, 19), <>Improve accuracy of T32 tier set module</>, Trevor),
  change(date(2024, 6, 17), <>Implement <SpellLink spell={TALENTS_EVOKER.ENGULF_TALENT}/> module</>, Trevor),
  change(date(2024, 6, 16), <>Add T32 tier set module</>, Trevor),
  change(date(2024, 6, 16), <>Split up linking normalizer files</>, Trevor),
  change(date(2024, 6, 16), <>Cleanup old tier sets</>, Trevor),
  change(date(2024, 6, 16), <>Re-enable Preservation and cleanup dead code</>, Trevor),
];
