// utils/normalizeCharacter.js

export const normalizeCharacter = (shape) => {
  try {
    // Нормализация экипированного оружия
    const weaponSlot = shape.weapon_slot
      ? {
          name: shape.weapon_slot.name || 'Оружие',
          type: shape.weapon_slot.slot_type || 'weapon',
          damage: shape.weapon_slot.damage || shape.weapon_slot.effect || '1d6',
          hand:
            shape.weapon_slot.slot_type === 'weapon' ? 'one-handed' : 'unknown',
        }
      : null;

    // Нормализация заклинаний
    const normalizedSpells = [];
    if (
      typeof shape.prepared_spells === 'string' &&
      shape.prepared_spells.trim()
    ) {
      const preparedNames = shape.prepared_spells
        .split(',')
        .map((name) => name.trim());

      preparedNames.forEach((spellName) => {
        const fullSpell = shape.spells?.find((s) => s.name === spellName);

        normalizedSpells.push({
          name: spellName,
          prepared: true,
          level: fullSpell?.level || 0,
          school: fullSpell?.school || 'Неизвестно',
          uses: fullSpell?.charges || 0,
          max_uses: fullSpell?.charges || 0,
          description: fullSpell?.effect || '',
        });
      });
    } else if (Array.isArray(shape.spells)) {
      shape.spells.forEach((spell) => {
        normalizedSpells.push({
          name: spell.name || 'Неизвестное заклинание',
          prepared: true,
          level: spell.level || 0,
          school: spell.school || 'Неизвестно',
          uses: spell.charges || 0,
          max_uses: spell.charges || 0,
          description: spell.effect || '',
        });
      });
    }

    // Нормализация предметов
    const normalizedItems = [];
    if (Array.isArray(shape.inventory_items)) {
      shape.inventory_items.forEach((entry) => {
        if (entry.item) {
          normalizedItems.push({
            id: entry.id,
            name: entry.item.name,
            type: entry.item.slot_type || 'misc',
            uses: entry.item.charges ?? entry.item.max_charges ?? 0,
            max_uses: entry.item.max_charges ?? entry.item.charges ?? 0,
            is_consumable: entry.item.is_consumable || false,
            equipped: entry.equipped || false,
          });
        }
      });
    }

    return {
      name: shape.name || 'Безымянный',
      class: shape.character_class?.name || 'Класс не задан',
      race: shape.race?.name || 'Раса не указана',
      level: shape.level || 1,
      hp: {
        current: shape.current_hp ?? 0,
        max: shape.max_hp ?? 0,
        temp: shape.temp_hp ?? 0,
      },
      weapons: weaponSlot ? [weaponSlot] : [],
      combatActions: [
        // { name: 'Толчок', type: 'action', available: true, cost: 'action' },
        // { name: 'Рывок', type: 'movement', available: true, cost: 'bonus' },
      ],
      spells: normalizedSpells,
      items: normalizedItems,
      statuses: Array.isArray(shape.statuses)
        ? shape.statuses.map((s) => String(s))
        : [],
      armorClass: shape.armor_class || 10,
      initiative: shape.initiative || 0,
      speed: shape.speed || 30,
      proficiencyBonus: shape.proficiency_bonus || 2,
      ap: {
        current: shape.current_ap ?? 0,
        max: shape.max_ap ?? 3,
      },
      extraAttacks: shape.extra_attacks || 0,
      isInvisible: shape.is_invisible || false,
      isStunned: shape.is_stunned || false,
      isParalyzed: shape.is_paralyzed || false,
    };
  } catch (error) {
    console.error('[normalizeCharacter] Ошибка нормализации:', error);
    return {
      name: 'Ошибка загрузки',
      class: 'Ошибка',
      race: 'Не указана',
      level: 1,
      hp: { current: 0, max: 0, temp: 0 },
      weapons: [],
      combatActions: [],
      spells: [],
      items: [],
      statuses: [],
      armorClass: 10,
      initiative: 0,
      speed: 30,
      proficiencyBonus: 2,
      ap: { current: 0, max: 3 },
      extraAttacks: 0,
      isInvisible: false,
      isStunned: false,
      isParalyzed: false,
    };
  }
};
