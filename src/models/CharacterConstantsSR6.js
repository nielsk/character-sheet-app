/**
 * Matching attribute full names to the character properties.
 */
export const attributes = Object.freeze({
    BODY: 'bod',
    STRENGTH: 'str',
    AGILITY: 'agi',
    REACTION: 'rea',
    LOGIC: 'log',
    INTUITION: 'intui',
    WILLPOWER: 'will',
    CHARISMA: 'cha',
    EDGE: 'edge',
    MAGIC: 'mag',
    RESONANCE: 'res'
});

/**
 * Matching skills to attributes.
 */
export const skillAttributes = Object.freeze({
    astral: attributes.MAGIC,
    athletics: attributes.AGILITY,
    biotech: attributes.LOGIC,
    close_combat: attributes.AGILITY,
    con: attributes.CHARISMA,
    conjuring: attributes.MAGIC,
    cracking: attributes.LOGIC,
    electronics: attributes.LOGIC,
    engineering: attributes.LOGIC,
    exotic_weapons: attributes.AGILITY,
    firearms: attributes.AGILITY,
    influence: attributes.CHARISMA,
    outdoors: attributes.INTUITION,
    perception: attributes.INTUITION,
    piloting: attributes.REACTION,
    sorcery: attributes.MAGIC,
    stealth: attributes.AGILITY,
    tasking: attributes.RESONANCE
});