import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import EventOrderNormalizer, { EventOrder } from 'parser/core/EventOrderNormalizer';
import { EventType } from 'parser/core/Events';
import { Options } from 'parser/core/Module';

const EVENT_ORDERS: EventOrder[] = [
  {
    beforeEventId: TALENTS.PYROBLAST_TALENT.id,
    beforeEventType: [EventType.Cast, EventType.BeginCast],
    afterEventId: [SPELLS.FURY_OF_THE_SUN_KING.id, SPELLS.FURY_OF_THE_SUN_KING_STACK.id],
    afterEventType: EventType.RemoveBuff,
    bufferMs: 50,
    anyTarget: true,
  },
  {
    beforeEventId: SPELLS.HOT_STREAK.id,
    beforeEventType: EventType.RemoveBuff,
    afterEventId: SPELLS.FURY_OF_THE_SUN_KING.id,
    afterEventType: [EventType.RemoveBuff, EventType.ApplyBuff],
    bufferMs: 50,
    anyTarget: true,
  },
];

class SunKingsBlessing extends EventOrderNormalizer {
  constructor(options: Options) {
    super(options, EVENT_ORDERS);
  }
}

export default SunKingsBlessing;
