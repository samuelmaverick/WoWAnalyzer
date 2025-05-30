import getBossName from 'common/getBossName';
import { getLabel as getDifficultyLabel } from 'game/DIFFICULTIES';
import { Boss, Phase, findZoneByBossId } from 'game/raids';
import Ad, { AdErrorBoundary, Location } from 'interface/Ad';
import Config from 'parser/Config';
import { ParseResultsTab } from 'parser/core/Analyzer';
import CharacterProfile from 'parser/core/CharacterProfile';
import Fight from 'parser/core/Fight';
import { PlayerInfo } from 'parser/core/Player';

import HeaderBackground from './HeaderBackground';
import NavigationBar from './NavigationBar';
import PhaseSelector from './PhaseSelector';
import TimeFilter from './TimeFilter';
import DungeonPullSelector from './DungeonPullSelector';

import './Header.scss';
import { useLingui } from '@lingui/react';
import { currentExpansion } from 'game/GameBranch';

interface Props {
  config: Config;
  player: PlayerInfo;
  characterProfile: CharacterProfile;
  boss: Boss | null;
  handleDungeonPullSelection: (dungeonPull: string) => void;
  handlePhaseSelection: (phase: string, instance: number) => void;
  applyFilter: (start: number, end: number) => void;
  phases: Record<string, Phase> | null;
  selectedPhase: string;
  selectedInstance: number;
  selectedDungeonPull: string;
  isLoading: boolean;
  fight: Fight;
  makeTabUrl: (tab: string, build?: string) => string;
  selectedTab: string;
  tabs: ParseResultsTab[];
}

const Header = ({
  config: { spec, branch },
  player: { name, icon },
  fight,
  boss,
  handlePhaseSelection,
  selectedPhase,
  selectedInstance,
  selectedDungeonPull,
  handleDungeonPullSelection,
  phases,
  isLoading,
  applyFilter,
  characterProfile,
  makeTabUrl,
  tabs,
  selectedTab,
}: Props) => {
  const { i18n } = useLingui();

  let playerThumbnail;
  if (characterProfile?.thumbnail?.startsWith('https')) {
    playerThumbnail = characterProfile.thumbnail;
  } else if (characterProfile?.thumbnail) {
    playerThumbnail = `https://render-${characterProfile.region}.worldofwarcraft.com/character/${characterProfile.thumbnail}`;
  } else {
    playerThumbnail = `/specs/${icon}.jpg`.replace(/ /, '');
  }

  const expansion = currentExpansion(branch);
  const raid = boss ? findZoneByBossId(boss.id) : undefined;

  return (
    <header>
      <HeaderBackground boss={boss} expansion={expansion} raid={raid} />

      <AdErrorBoundary>
        <Ad location={Location.Top} />
      </AdErrorBoundary>

      <div className="subnavigation container">
        {phases && Object.keys(phases).length > 0 && (
          <div className="phaseselector">
            <PhaseSelector
              fight={fight}
              phases={phases}
              handlePhaseSelection={handlePhaseSelection}
              selectedPhase={selectedPhase}
              selectedInstance={selectedInstance}
              isLoading={isLoading}
            />
          </div>
        )}
        {fight.dungeonPulls && fight.dungeonPulls.length > 0 && (
          <div className="phaseselector">
            <DungeonPullSelector
              fight={fight}
              selectedPull={selectedDungeonPull}
              handlePullSelection={handleDungeonPullSelection}
              isLoading={isLoading}
            />
          </div>
        )}
        <div className="timefilter">
          <TimeFilter fight={fight} isLoading={isLoading} applyFilter={applyFilter} />
        </div>
      </div>

      <div className="info container">
        <div className="boss" data-testid="boss-difficulty-and-name">
          <h2>{getDifficultyLabel(fight.difficulty)}</h2>
          <h1>{boss ? boss.name : getBossName(fight, false)}</h1>
        </div>
        <div className="player">
          <div className="avatar">
            <img src={playerThumbnail} alt="" />
          </div>
          <div className="details">
            <h2>
              {spec.specName ? i18n._(spec.specName) : ''} {i18n._(spec.className)}
            </h2>
            <h1 className="name">{name}</h1>
          </div>
        </div>
      </div>

      <NavigationBar makeTabUrl={makeTabUrl} tabs={tabs} selectedTab={selectedTab} />
    </header>
  );
};

export default Header;
