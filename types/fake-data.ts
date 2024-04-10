import { source_book, edge_action_restriction, rule_category } from '@prisma/client';
import { faker } from '@faker-js/faker';
import Decimal from 'decimal.js';



export function fakeEdgeBoost() {
  return {
    name: faker.person.fullName(),
    cost: faker.number.int(),
    description: faker.lorem.words(5),
    source: faker.helpers.arrayElement([source_book.core, source_book.wyrd, source_book.wild_life, source_book.firing_squad, source_book.companion, source_book.body_shop, source_book.shifter, source_book.homebrew] as const),
    page: faker.number.int(),
  };
}
export function fakeEdgeBoostComplete() {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    cost: faker.number.int(),
    description: faker.lorem.words(5),
    source: faker.helpers.arrayElement([source_book.core, source_book.wyrd, source_book.wild_life, source_book.firing_squad, source_book.companion, source_book.body_shop, source_book.shifter, source_book.homebrew] as const),
    page: faker.number.int(),
    updated_at: new Date(),
  };
}
export function fakeEdgeAction() {
  return {
    name: faker.person.fullName(),
    cost: faker.number.int(),
    restriction: faker.helpers.arrayElement([edge_action_restriction.melee_attack, edge_action_restriction.ranged_attack, edge_action_restriction.any_attack, edge_action_restriction.any, edge_action_restriction.specific, edge_action_restriction.block, edge_action_restriction.ranged_attack_from_cover, edge_action_restriction.use_skill, edge_action_restriction.multi_attack] as const),
    description: faker.lorem.words(5),
    source: faker.helpers.arrayElement([source_book.core, source_book.wyrd, source_book.wild_life, source_book.firing_squad, source_book.companion, source_book.body_shop, source_book.shifter, source_book.homebrew] as const),
    page: faker.number.int(),
  };
}
export function fakeEdgeActionComplete() {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    cost: faker.number.int(),
    restriction: faker.helpers.arrayElement([edge_action_restriction.melee_attack, edge_action_restriction.ranged_attack, edge_action_restriction.any_attack, edge_action_restriction.any, edge_action_restriction.specific, edge_action_restriction.block, edge_action_restriction.ranged_attack_from_cover, edge_action_restriction.use_skill, edge_action_restriction.multi_attack] as const),
    description: faker.lorem.words(5),
    source: faker.helpers.arrayElement([source_book.core, source_book.wyrd, source_book.wild_life, source_book.firing_squad, source_book.companion, source_book.body_shop, source_book.shifter, source_book.homebrew] as const),
    page: faker.number.int(),
    updated_at: new Date(),
  };
}
export function fakeRule() {
  return {
    category: faker.helpers.arrayElement([rule_category.edge, rule_category.magic, rule_category.combat, rule_category.decking, rule_category.rigging, rule_category.regeneration, rule_category.critter, rule_category.spirits, rule_category.other] as const),
    name: faker.person.fullName(),
    description: undefined,
    source: undefined,
    page: undefined,
  };
}
export function fakeRuleComplete() {
  return {
    id: faker.string.uuid(),
    category: faker.helpers.arrayElement([rule_category.edge, rule_category.magic, rule_category.combat, rule_category.decking, rule_category.rigging, rule_category.regeneration, rule_category.critter, rule_category.spirits, rule_category.other] as const),
    name: faker.person.fullName(),
    description: undefined,
    updated_at: new Date(),
    homebrew: false,
    source: undefined,
    page: undefined,
  };
}
export function fakeHomebrew() {
  return {
    category: faker.helpers.arrayElement([rule_category.edge, rule_category.magic, rule_category.combat, rule_category.decking, rule_category.rigging, rule_category.regeneration, rule_category.critter, rule_category.spirits, rule_category.other] as const),
    name: faker.person.fullName(),
    description: faker.lorem.words(5),
  };
}
export function fakeHomebrewComplete() {
  return {
    id: faker.string.uuid(),
    category: faker.helpers.arrayElement([rule_category.edge, rule_category.magic, rule_category.combat, rule_category.decking, rule_category.rigging, rule_category.regeneration, rule_category.critter, rule_category.spirits, rule_category.other] as const),
    name: faker.person.fullName(),
    description: faker.lorem.words(5),
    updated_at: new Date(),
  };
}
