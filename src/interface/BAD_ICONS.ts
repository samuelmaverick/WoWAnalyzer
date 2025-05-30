// icons in this array get our icons instead of the ones from blizzards API
// make sure to add the correct icon in public/img/Icons/

import EVOKER_TALENTS from 'common/TALENTS/evoker';

// http://wow.zamimg.com/images/wow/icons/large/????????.jpg has usually the correct ones
// or https://media-azeroth.cursecdn.com/wow/icons/large/????????.jpg
// some icons have in their corners lighter pixels, might require some photoshop-skills

const BAD_ICONS: string[] = ['equipment_empty_gem_socket'];
export default BAD_ICONS;

export const ICON_RENAME: Record<string, string> = {
  spell_priest_power_word: 'spell_priest_power-word',
  spell_priest_void_flay: 'spell_priest_void-flay',
  spell_priest_shadow_mend: 'spell_priest_shadow-mend',
  spell_priest_void_blast: 'spell_priest_void-blast',
  spell_frost_piercing_chill: 'spell_frost_piercing-chill',
  spell_frost_ice_shards: 'spell_frost_ice-shards',
  warlock_summon__voidlord: 'warlock_summon_-voidlord',
};

export const SPELL_ICON_OVERRIDES: Record<number, string> = {
  [EVOKER_TALENTS.CALL_OF_YSERA_TALENT.id]: '4096390',
};
