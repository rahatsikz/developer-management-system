import { User } from "@/types";

export function getUserAcronym(user: User) {
  const usedAcronyms = new Set<string>();
  const makeUnique = (base: string) => {
    let acronym = base;
    let i = 2;
    // If there's a clash, extend by one more character:
    while (usedAcronyms.has(acronym)) {
      acronym = base.slice(0, ++i).toUpperCase();
    }
    usedAcronyms.add(acronym);
    return acronym;
  };

  // Preferred source for acronym: name if available, else email
  const source = user.name?.trim() || user.email;
  // Take first 2 letters (uppercased)
  const raw = source?.replace(/\s+/g, "").slice(0, 2).toUpperCase();
  const acronym = makeUnique(raw);
  return acronym;
}
