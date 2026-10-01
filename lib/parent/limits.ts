/**
 * How many children a parent may link, by plan.
 *
 * Lives here rather than inline because three files need to agree: the parent
 * dashboard (how many are shown), the invite API (how many codes may be issued),
 * and the plan's marketing copy in lib/billing/plans.ts ("Up to 5 children").
 * Update all three together.
 */

export const FREE_MAX_CHILDREN = 1;
export const MAX_CHILDREN = 5;