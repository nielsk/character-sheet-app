/**
 * Model for SR6 character data
 */

import { skillAttributes } from './CharacterConstantsSR6.js';
import Weapon from './Weapon.js';
import Character from './Character.js';

export default class CharacterSR6 extends Character {
    /**
     * Property notes...
     * @prop {String} key Unique (in one instance of the app) id for the character. 7 Random letters/numbers.
     * @prop {String} charname Name.
     * @prop {Object} class_points Class point like ki, sorcerer points, etc.
     * @prop {Number} class_points.cur
     * @prop {Number} class_points.max
     * @prop {Weapon[]} weapons Weapon data (name, att, dam, notes).
     * @prop {String[]} features Special features and abilities.
     * @prop {String[]} equipment Stuff the character carries.
     * @prop {CharacterNote[]} notes_adv Adventure notes
     * @prop {CharacterNote[]} notes_cam Campaign notes
     * @prop {CharacterNote[]} npcs NPC notes
     * @prop {CharacterNote[]} factions NPC notes
     * @prop {CharacterNote[]} partymembers Other party members.
     * @prop {Object} skills Skill and its level. 0/1/2 (See skillLevels).
     */
    constructor ({
        key = '',
        charname = '',
        metatype = '',
        current_karma = 0,
        total_karma = 0,
        bod = 1,
        agi = 1,
        str = 1,
        rea = 1,
        will = 1,
        log = 1,
        intui = 1,
        cha = 1,
        edge = 1,
        mag = 0,
        res = 0,
        skills = {
            astral: 0,
            athletics: 0,
            biotech: 0,
            close_combat: 0,
            con: 0,
            conjuring: 0,
            cracking: 0,
            electronics: 0,
            engineering: 0,
            exotic_weapons: 0,
            firearms: 0,
            influence: 0,
            outdoors: 0,
            perception: 0,
            piloting: 0,
            sorcery: 0,
            stealth: 0,
            tasking: 0
        },
        knowledge_skills = '',
        weapons = [],
        appearance = '',
        equipment = [],
        nuyen = '',
        positive_qualities = [],
        negative_qualities = [],
        notes = '',
        notes_adv = [],
        notes_cam = [],
        contacts = [],
        partymembers = [],
        magic_tradition = '',
        magic_attribute = '',
        spells = [],
        updated = '',
        key_prev = '',
        version = ''
    }) {
        super({
            key,
            charname,
            updated,
            key_prev,
            version
        });
        this.charname = charname;
        this.metatype = metatype;
        this.current_karma = current_karma;
        this.bod = bod;
        this.agi = agi;
        this.str = str;
        this.rea = rea;
        this.will = will;
        this.log = log;
        this.intui = intui;
        this.cha = cha;
        this.edge = edge;
        this.mag = mag;
        this.res = res;
        this.skills = skills;

        this.weapons = [];
        weapons.forEach((item) => {
            // Remove null and non-objects
            if (item && typeof item !== 'object') {
                return;
            }
            // @version < 3.0.0 backwards compat
            if (Array.isArray(item)) {
                // convert
                this.weapons.push(new Weapon({
                    name: item[0] || '',
                    attack: item[1] || '',
                    damage: item[2] || '',
                    notes: item[3] || ''
                }));
                return;
            }
            if (item instanceof Weapon) {
                this.weapons.push(item);
                return;
            }
            this.weapons.push(new Weapon(item));
        });

        this.knowledge_skills = knowledge_skills;
        this.positive_qualities = positive_qualities;
        this.negative_qualities = negative_qualities;
        this.appearance = appearance;
        this.equipment = equipment;
        this.nuyen = nuyen;
        this.notes = notes;
        this.notes_adv = this._convertNotes(notes_adv);
        this.notes_cam = this._convertNotes(notes_cam);
        this.contacts = this._convertNotes(contacts);
        this.partymembers = this._convertNotes(partymembers);
        this.magic_tradition = magic_tradition;
        this.magic_attribute = magic_attribute;
        this.spells = spells;

        this.emitter = null;
    }
    get className () {
        return 'CharacterSR6';
    }
    get ruleset () {
        return 'SR6';
    }
    /**
     * Level getter.
     * @returns {Number}
     */
    get level () {
        return this._level;
    }
    /**
     * Set level and trigger proficiency update if necessary.
     * @param {Number}
     */
    set level (newVal) {
        const cur = this.level;
        if (newVal === cur) {
            return;
        }
        const prof = this.proficiency;
        this._level = newVal;
        const newProf = this.proficiency;
        if (prof === newProf) {
            return;
        }
        if (this.emitter) {
            this.emitter.trigger('character:proficiency:update');
        }
    }
    /**
     * Proficiency modifier as string.
     * @returns {String}
     */
    get proficiency () {
        const bonus = Math.ceil(this.level / 4) + 1;
        return `+${bonus}`;
    }
    /**
     * Set an attribute score.
     * @param {String} attribute
     * @param {Number} value
     */
    setAttribute (attribute, value) {
        if (!this[attribute]) {
            return;
        }
        const curVal = this[attribute];
        if (curVal === value) {
            return;
        }
        this[attribute] = value;
        if (this.emitter) {
            this.emitter.trigger('character:attribute:update', attribute);
            // Update any relevant skill mods.
            for (const skill in skillAttributes) {
                if (skillAttributes[skill] === attribute) {
                    this.emitter.trigger('character:skill:update', skill, this.getSkillMod(skill));
                }
            }
        }
    }
    /**
     * Get modifier for an attribute.
     * @param {String} attribute Attribute short code
     * @returns {String}
     */
    attributeMod (attribute) {
        const score = this[attribute];
        if (Number.isNaN(score)) {
            return '0';
        }
        const raw = Math.floor((score - 10) / 2);
        return (raw > 0) ? `+${raw}` : raw.toString();
    }
    /**
     * Are they proficient in a skill.
     * @param {String} skill
     * @returns {Boolean}
     */
    isProficient (skill) {
        return this.skills[skill] > skillLevels.UNSKILLED;
    }
    /**
     * Are they expert in a skill.
     * @param {String} skill
     * @returns {Boolean}
     */
    isExpert (skill) {
        return this.skills[skill] === skillLevels.EXPERT;
    }
    /**
     * Get the modifier for a skill.
     * @param {String} skill
     * @returns {String}
     */
    getSkillMod (skill) {
        let raw = 0;
        const skillLevel = this.skills[skill];
        if (typeof skillLevel === 'undefined') {
            return 0;
        }
        const attribute = skillAttributes[skill];
        if (attribute) {
            raw += parseInt(this.attributeMod(attribute), 10);
        }
        const prof = parseInt(this.proficiency, 10);
        if (this.isProficient(skill)) {
            raw += prof;
        }
        if (this.isExpert(skill)) {
            raw += prof;
        }
        return (raw > 0) ? `+${raw}` : raw.toString();
    }
    /**
     * Get skill proficiency
     * @param {String} skill
     * @returns {Number}
     */
    getSkill (skill) {
        const value = this.skills[skill];
        if (typeof value === 'undefined') {
            return null;
        }
        return value;
    }
    /**
     * Set a skill proficiency.
     * @param {String} skill
     * @param {Number} newValue
     */
    setSkill (skill, newValue) {
        const curValue = this.getSkill(skill);
        if (curValue === null || curValue === newValue) {
            return;
        }
        this.skills[skill] = newValue;
        if (this.emitter) {
            this.emitter.trigger('character:skill:update', skill, this.getSkillMod(skill));
        }
    }
    /**
     * Is the attribute save proficient.
     * @param {String} attr
     * @returns {Number}
     */
    isSaveProficient (attr) {
        return (this.saves[attr] || 0);
    }
    /**
     * Get the save modifier for an attribute.
     * @param {String} attr
     * @returns {String}
     */
    saveMod (attr) {
        let profMod = 0;
        if (this.isSaveProficient(attr)) {
            profMod = parseInt(this.proficiency, 10);
        }
        const raw = 0 + profMod + parseInt(this.attributeMod(attr), 10);
        return (raw > 0) ? `+${raw}` : raw.toString();
    }
    /**
     * Set/unset a save proficiency.
     * @param {String} attr
     * @param {Number} checked
     */
    setSaveProficiency (attr, checked) {
        const cur = this.saves[attr];
        if (typeof cur === 'undefined') {
            return;
        }
        if (cur === checked) {
            return;
        }
        this.saves[attr] = (checked ? 1 : 0);
        if (this.emitter) {
            this.emitter.trigger('character:save:update', attr);
        }
    }
};
