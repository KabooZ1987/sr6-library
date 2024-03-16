// import { source_book, edge_action_restriction, rule_category } from '@prisma/client';
import { faker } from '@faker-js/faker';
// import Decimal from 'decimal.js';



export function fakeEdgeBoost() {
  return {
    name: faker.person.fullName(),
    cost: faker.number.int(),
    description: faker.lorem.words(5),
    source: faker.helpers.arrayElement(["core", "wyrd", "wild_life", "firing_squad", "companion", "body_shop", "shifter", "homebrew"] as const),
    page: faker.number.int(),
  };
}
export function fakeEdgeBoostComplete() {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    cost: faker.number.int(),
    description: faker.lorem.words(5),
    source: faker.helpers.arrayElement(["core", "wyrd", "wild_life", "firing_squad", "companion", "body_shop", "shifter", "homebrew"] as const),
    page: faker.number.int(),
    updated_at: new Date(),
  };
}
export function fakeEdgeAction() {
  return {
    name: faker.person.fullName(),
    cost: faker.number.int(),
    restriction: faker.helpers.arrayElement(["melee_attack", "ranged_attack", "any_attack", "any", "specific", "block", "ranged_attack_from_cover", "use_skill", "multi_attack"] as const),
    description: faker.lorem.words(5),
    source: faker.helpers.arrayElement(["core", "wyrd", "wild_life", "firing_squad", "companion", "body_shop", "shifter", "homebrew"] as const),
    page: faker.number.int(),
  };
}
export function fakeEdgeActionComplete() {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    cost: faker.number.int(),
    restriction: faker.helpers.arrayElement(["melee_attack", "ranged_attack", "any_attack", "any", "specific", "block", "ranged_attack_from_cover", "use_skill", "multi_attack"] as const),
    description: faker.lorem.words(5),
    source: faker.helpers.arrayElement(["core", "wyrd", "wild_life", "firing_squad", "companion", "body_shop", "shifter", "homebrew"] as const),
    page: faker.number.int(),
    updated_at: new Date(),
  };
}
export function fakeRule() {
  return {
    category: faker.helpers.arrayElement(["edge", "magic", "combat", "decking", "rigging", "regeneration", "critter", "spirits", "other"] as const),
    name: faker.person.fullName(),
    description: faker.lorem.words(5),
    source: undefined,
    page: undefined,
  };
}
export function fakeRuleComplete() {
  return {
    id: faker.string.uuid(),
    category: faker.helpers.arrayElement(["edge", "magic", "combat", "decking", "rigging", "regeneration", "critter", "spirits", "other"] as const),
    name: faker.person.fullName(),
    description: faker.lorem.words(5),
    updated_at: new Date(),
    homebrew: false,
    source: undefined,
    page: undefined,
  };
}
export function fakeHomebrew() {
  return {
    category: faker.helpers.arrayElement(["edge", "magic", "combat", "decking", "rigging", "regeneration", "critter", "spirits", "other"] as const),
    name: faker.person.fullName(),
    description: faker.lorem.words(5),
  };
}
export function fakeHomebrewComplete() {
  return {
    id: faker.string.uuid(),
    category: faker.helpers.arrayElement(["edge", "magic", "combat", "decking", "rigging", "regeneration", "critter", "spirits", "other"] as const),
    name: faker.person.fullName(),
    description: faker.lorem.words(5),
    updated_at: new Date(),
  };
}
