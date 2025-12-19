import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utilitaire pour fusionner les classes CSS avec tailwind-merge et clsx.
 * Permet de manipuler les classes conditionnelles proprement.
 *
 * @param inputs - Liste de classes, objets ou expressions conditionnelles
 * @returns La chaîne de caractères finale des classes fusionnées
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
