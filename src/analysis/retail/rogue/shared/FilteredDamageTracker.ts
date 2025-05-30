import Spell from 'common/SPELLS/Spell';
import { AnyEvent, CastEvent, DamageEvent, HealEvent } from 'parser/core/Events';
import DamageTracker from 'parser/shared/modules/AbilityTracker';
import { ReactNode } from 'react';
import { addInefficientCastReason } from 'parser/core/EventMetaLib';

type FilteredDamageObserver = (event: CastEvent) => void;

class FilteredDamageTracker extends DamageTracker {
  castObservers: FilteredDamageObserver[] = [];

  onDamage(event: DamageEvent) {
    if (!this.shouldProcessEvent(event)) {
      return;
    }
    super.onDamage(event);
  }

  onHeal(event: HealEvent) {
    if (!this.shouldProcessEvent(event)) {
      return;
    }
    super.onHeal(event);
  }

  onCast(event: CastEvent) {
    if (!this.shouldProcessEvent(event)) {
      return;
    }
    this.broadcastCastEvent(event);
    super.onCast(event);
  }

  shouldProcessEvent(event: CastEvent | DamageEvent | HealEvent) {
    return false;
  }

  subscribeToCastEvent(fn: FilteredDamageObserver) {
    this.castObservers.push(fn);
  }

  subscribeInefficientCast(spells: Spell[], messageFunction: (spell: Spell) => ReactNode) {
    this.subscribeToCastEvent((event) => {
      const spell = spells.find((s) => event.ability.guid === s.id);
      if (spell) {
        addInefficientCastReason(event, messageFunction(spell));
      }
    });
  }

  broadcastCastEvent(event: CastEvent) {
    this.castObservers.forEach((subscriber) => subscriber(event));
  }
}

export default FilteredDamageTracker;
