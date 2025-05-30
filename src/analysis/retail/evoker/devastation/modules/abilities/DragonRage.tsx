import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  CastEvent,
  EmpowerEndEvent,
  FightEndEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';

const {
  DISINTEGRATE,
  FIRE_BREATH,
  FIRE_BREATH_FONT,
  ETERNITY_SURGE,
  ETERNITY_SURGE_FONT,
  ESSENCE_BURST_DEV_BUFF,
} = SPELLS;

const { DRAGONRAGE_TALENT, PYRE_TALENT } = TALENTS_EVOKER;

export interface RageWindowCounter {
  start: number;
  fireBreaths: number;
  eternitySurges: number;
  essenceBursts: number;
  pyres: number;
  disintegrateTicks: number;
  end: number;
  fightEndDuringDR: boolean;
}

class DragonRage extends Analyzer {
  totalBreaths = 0;
  totalApplications = 0;
  totalCasts = 0;
  inDragonRageWindow = false;
  rageWindowCounters: Record<number, RageWindowCounter> = {};

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(DRAGONRAGE_TALENT),
      (event) => {
        this.onApplyDragonrage(event);
      },
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(DRAGONRAGE_TALENT),
      (event) => {
        this.onRemoveDragonrage(event);
      },
    );

    this.addEventListener(Events.fightend, (event) => {
      this.endOfFightCheck(event);
    });

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(ESSENCE_BURST_DEV_BUFF),
      () => {
        if (!this.inDragonRageWindow) {
          return;
        }

        this.currentRageWindow.essenceBursts += 1;
      },
    );

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell([DISINTEGRATE]), () => {
      if (!this.inDragonRageWindow) {
        return;
      }

      this.currentRageWindow.disintegrateTicks += 1;
    });

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(PYRE_TALENT), () => {
      if (!this.inDragonRageWindow) {
        return;
      }

      this.currentRageWindow.pyres += 1;
    });

    this.addEventListener(
      Events.empowerEnd
        .by(SELECTED_PLAYER)
        .spell([FIRE_BREATH, FIRE_BREATH_FONT, ETERNITY_SURGE, ETERNITY_SURGE_FONT]),
      (event) => {
        this.onEmpowerCast(event);
      },
    );
  }

  onApplyDragonrage(event: ApplyBuffEvent) {
    this.inDragonRageWindow = true;
    this.totalCasts += 1;
    this.rageWindowCounters[this.totalCasts] = {
      start: event.timestamp,
      fireBreaths: 0,
      eternitySurges: 0,
      essenceBursts: 0,
      disintegrateTicks: 0,
      pyres: 0,
      end: 0,
      fightEndDuringDR: false,
    };
  }

  onRemoveDragonrage(event: RemoveBuffEvent) {
    this.inDragonRageWindow = false;
    if (this.rageWindowCounters[this.totalCasts] === undefined) {
      return;
    }
    this.rageWindowCounters[this.totalCasts].end = event.timestamp;
  }

  onEmpowerCast(event: CastEvent | EmpowerEndEvent) {
    if (!this.inDragonRageWindow) {
      return;
    }

    switch (event.ability.name) {
      case FIRE_BREATH.name:
        this.currentRageWindow.fireBreaths += 1;
        break;
      case ETERNITY_SURGE.name:
        this.currentRageWindow.eternitySurges += 1;
        break;
    }
  }

  // Fix edgecase where DR window was registered but wasn't ended due to fight ending during the window
  endOfFightCheck(event: FightEndEvent) {
    if (this.inDragonRageWindow) {
      this.inDragonRageWindow = false;
      this.rageWindowCounters[this.totalCasts].fightEndDuringDR = true;
      this.rageWindowCounters[this.totalCasts].end = event.timestamp;
    }
  }

  get currentRageWindow() {
    return this.rageWindowCounters[this.totalCasts];
  }
}

export default DragonRage;
