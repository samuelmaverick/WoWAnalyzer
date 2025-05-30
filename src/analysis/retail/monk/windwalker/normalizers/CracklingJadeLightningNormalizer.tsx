import SPELLS from 'common/SPELLS';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import EventOrderNormalizer, { EventOrder } from 'parser/core/EventOrderNormalizer';
import { EventType } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import Channeling from 'parser/shared/normalizers/Channeling';

const MAX_DELAY = 500;

const EVENT_ORDERS: EventOrder[] = [
  {
    beforeEventId: SPELLS.CRACKLING_JADE_LIGHTNING.id,
    beforeEventType: EventType.Damage,
    afterEventId: SPELLS.CRACKLING_JADE_LIGHTNING.id,
    afterEventType: EventType.RemoveBuff,
    bufferMs: MAX_DELAY,
    anyTarget: true,
    updateTimestamp: true,
  },
  {
    beforeEventId: SPELLS.CRACKLING_JADE_LIGHTNING.id,
    beforeEventType: EventType.Damage,
    afterEventId: SPELLS.CRACKLING_JADE_LIGHTNING.id,
    afterEventType: EventType.EndChannel,
    bufferMs: MAX_DELAY,
    anyTarget: true,
    updateTimestamp: true,
  },
];

export class CracklingJadeLightningNormalizer extends EventOrderNormalizer {
  static dependencies = {
    ...EventOrderNormalizer.dependencies,
    // we explicitly depend on the channeling normalizer here to make sure the endchannel event exists
    channeling: Channeling,
  };
  constructor(options: Options) {
    super(options, EVENT_ORDERS);
  }
}

const castLink: EventLink = {
  linkRelation: 'cjl-cast',
  linkingEventId: SPELLS.CRACKLING_JADE_LIGHTNING.id,
  linkingEventType: EventType.EndChannel,
  referencedEventType: [EventType.Cast, EventType.BeginCast],
  referencedEventId: null,
  forwardBufferMs: 100,
  anySource: false,
  anyTarget: true,
  maximumLinks: 1,
};

export class CracklingJadeLightningLinkNormalizer extends EventLinkNormalizer {
  static dependencies = {
    ...EventLinkNormalizer.dependencies,
    // we explicitly depend on the channeling normalizer here to make sure the endchannel event exists
    channeling: Channeling,
  };
  constructor(options: Options) {
    super(options, [castLink]);
  }
}
