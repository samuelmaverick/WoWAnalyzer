import {
  TwistOfFate,
  ShadowfiendNormalizer,
  TwinsOfTheSunPriestess,
} from 'analysis/retail/priest/shared';
import MainCombatLogParser from 'parser/core/CombatLogParser';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';
import Channeling from 'parser/shared/normalizers/Channeling';
import CancelledCasts from './modules/features/CancelledCasts';

import Guide from 'analysis/retail/priest/shadow/Guide';

import Abilities from './modules/Abilities';
import AbilityTracker from './modules/core/AbilityTracker';
import GlobalCooldown from './modules/core/GlobalCooldown';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Buffs from './modules/features/Buffs';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import ShadowyInsight from './modules/talents/ShadowyInsight';
import DotUptimes from './modules/features/DotUptimes';
import Voidform from './modules/spells/Voidform';
import Voidbolt from './modules/spells/Voidbolt';
import InsanityTracker from './modules/resources/InsanityTracker';
import InsanityUsage from './modules/resources/InsanityUsage';
import DevouringPlague from './modules/spells/DevouringPlague';
import DarkEvangelism from './modules/talents/DarkEvangelism';
import Dispersion from './modules/talents/Dispersion';
import ShadowWordDeath from './modules/spells/ShadowWordDeath';
import ShadowWordPain from './modules/spells/ShadowWordPain';
import VampiricEmbrace from './modules/talents/VampiricEmbrace';
import VampiricTouch from './modules/spells/VampiricTouch';
import DeathAndMadness from './modules/talents/DeathAndMadness';
import ShadowCrash from './modules/talents/ShadowCrash';
import InsidiousIre from './modules/talents/InsidiousIre';
import InescapableTorment from './modules/talents/InescapableTorment';
import UnfurlingDarkness from './modules/talents/UnfurlingDarkness';
import Deathspeaker from './modules/talents/Deathspeaker';
import MindSpikeInsanity from './modules/talents/MindSpikeInsanity';
import AncientMadness from './modules/talents/AncientMadness';
import VoidTorrent from './modules/talents/VoidTorrent';
import MindFlayInsanity from './modules/talents/MindFlayInsanity';
import MindDevourer from './modules/talents/MindDevourer';
import IdolOfCthun from './modules/talents/IdolOfCthun';
import IdolOfYoggSaron from './modules/talents/IdolOfYoggSaron';
import IdolOfNzoth from './modules/talents/IdolOfNzoth';
import IdolOfYshaarj from './modules/talents/IdolOfYshaarj';
import InsanityGraph from './modules/guide/InsanityGraph';
import ShadowyApparitions from './modules/spells/ShadowyApparitions';
import AuspiciousSpirits from './modules/talents/AuspiciousSpirits';
import PhantasmalPathogen from './modules/talents/PhantasmalPathogen';
import TormentedSpirits from './modules/talents/TormentedSpirits';
import PsychicLink from './modules/talents/PsychicLink';
import VoidTouched from './modules/talents/VoidTouched';
import MindsEye from './modules/talents/MindsEye';
import DistortedReality from './modules/talents/DistortedReality';
import MaddeningTouch from './modules/talents/Maddening Touch';
import MindMelt from './modules/talents/MindMelt';
import Mastermind from './modules/talents/Mastermind';
import DarkAscension from './modules/talents/DarkAscension';
import Shadowform from './modules/spells/Shadowform';
import PerfectedForm from './modules/talents/Archon/PerfectedForm';
import EnergyCompression from './modules/talents/Archon/EnergyCompression';
import EmpoweredSurges from './modules/talents/Archon/EmpoweredSurges';
import ResonantEnergy from './modules/talents/Archon/ResonantEnergy';
import EnergyCycle from './modules/talents/Archon/EnergyCycle';
import ConcentratedInfusion from './modules/talents/Archon/Concentrated Infusion';
import SustainedPotency from './modules/talents/Archon/SustainedPotency';
import ManifestedPower from './modules/talents/Archon/ManifestedPower';
import EntropicRift from './modules/talents/Voidweaver/EntropicRift';
import VoidBlast from './modules/talents/Voidweaver/VoidBlast';
import InnerQuietus from './modules/talents/Voidweaver/InnerQuietus';
import Voidheart from './modules/talents/Voidweaver/Voidheart';
import DevourMatter from './modules/talents/Voidweaver/DevourMatter';
import VoidEmpowerment from './modules/talents/Voidweaver/VoidEmpowerment';
import DepthOfShadows from './modules/talents/Voidweaver/DepthOfShadows';
import ShadowTierTWWS1 from './modules/tier/ShadowTierTWWS1';
import ShadowTierTWWS2 from './modules/tier/ShadowTierTWWS2';
import ShadowTierTWWS2Normalizer from './modules/tier/ShadowTierTWWS2Normalizer';

class CombatLogParser extends MainCombatLogParser {
  static specModules = {
    // core
    abilities: Abilities,
    abilityTracker: AbilityTracker,
    globalCooldown: GlobalCooldown,

    // features:
    alwaysBeCasting: AlwaysBeCasting,
    buffs: Buffs,
    cancelledCasts: CancelledCasts,
    cooldownThroughputTracker: CooldownThroughputTracker,
    dotUptimes: DotUptimes,

    // resources:
    insanityTracker: InsanityTracker,
    insanityUsage: InsanityUsage,
    insanityGraph: InsanityGraph,

    // spells:
    devouringPlague: DevouringPlague,
    shadowform: Shadowform,
    shadowWordDeath: ShadowWordDeath,
    shadowWordPain: ShadowWordPain,
    shadowyApparitions: ShadowyApparitions,
    vampiricTouch: VampiricTouch,
    voidbolt: Voidbolt,
    voidform: Voidform,

    // Spec talents:
    ancientMadness: AncientMadness,
    auspiciousSpirits: AuspiciousSpirits,
    darkAscension: DarkAscension,
    darkEvangelism: DarkEvangelism,
    deathspeaker: Deathspeaker,
    dispersion: Dispersion,
    distortedReality: DistortedReality,
    idolOfCthun: IdolOfCthun,
    idolOfNzoth: IdolOfNzoth,
    idolOfYoggSaron: IdolOfYoggSaron,
    idolOfYshaarj: IdolOfYshaarj,
    inescapableTorment: InescapableTorment,
    insidiousIre: InsidiousIre,
    maddeningTouch: MaddeningTouch,
    mastermind: Mastermind,
    mindDevourer: MindDevourer,
    mindFlayInsanity: MindFlayInsanity,
    mindMelt: MindMelt,
    mindsEye: MindsEye,
    mindSpikeInsanity: MindSpikeInsanity,
    phantasmalPathogen: PhantasmalPathogen,
    psychicLink: PsychicLink,
    shadowCrash: ShadowCrash,
    shadowyInsight: ShadowyInsight,
    tormentedSpirits: TormentedSpirits,
    unfurlingDarkness: UnfurlingDarkness,
    voidTorrent: VoidTorrent,
    voidTouched: VoidTouched,

    // Class Talents:
    deathAndMadness: DeathAndMadness,
    twinsOfTheSunPriestess: TwinsOfTheSunPriestess,
    twistOfFate: TwistOfFate,
    vampiricEmbrace: VampiricEmbrace,

    // Hero Talents
    //Archon
    perfectedForm: PerfectedForm,
    energyCompression: EnergyCompression,
    empoweredSurges: EmpoweredSurges,
    resonantEnergy: ResonantEnergy,
    energyCycle: EnergyCycle,
    concentratedInfusion: ConcentratedInfusion,
    sustainedPotency: SustainedPotency,
    manifestedPower: ManifestedPower,

    //Voidweaver
    entropicRift: EntropicRift,
    voidBlast: VoidBlast,
    innerQuietus: InnerQuietus,
    voidheart: Voidheart,
    devourMatter: DevourMatter,
    voidEmpowerment: VoidEmpowerment,
    depthsOfShadows: DepthOfShadows,

    // normalizers:
    channeling: Channeling,
    shadowfiendNormalizer: ShadowfiendNormalizer,

    //Tier
    shadowTierTWWS1: ShadowTierTWWS1,
    shadowTierTWWS2: ShadowTierTWWS2,
    shadowTierTWWS2Normalizer: ShadowTierTWWS2Normalizer,

    arcaneTorrent: [ArcaneTorrent, { active: false }] as const,
  };

  static guide = Guide;
}

export default CombatLogParser;
