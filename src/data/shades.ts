/**
 * The Red Spectrum. Every product is assigned exactly one shade from this list.
 */
export type ShadeId =
  | "scarlet"
  | "crimson"
  | "cherry"
  | "ruby"
  | "vermilion"
  | "garnet"
  | "oxblood";

export interface Shade {
  id: ShadeId;
  name: string;
  hex: string;
  rgb: [number, number, number];
  /** Text colour that stays legible on top of the swatch. */
  ink: string;
  mood: string;
  texture: string;
  note: string;
}

export const shades: Shade[] = [
  {
    id: "scarlet",
    name: "Scarlet",
    hex: "#FF2400",
    rgb: [255, 36, 0],
    ink: "#1a0503",
    mood: "Loud, bright, unafraid",
    texture: "Brushed cotton jersey",
    note: "The shade of a siren and a stop sign. Scarlet leans warm and carries across a room before you do.",
  },
  {
    id: "crimson",
    name: "Crimson",
    hex: "#DC143C",
    rgb: [220, 20, 60],
    ink: "#f8eee8",
    mood: "Assured, sharply tailored",
    texture: "Wool gabardine and raffia",
    note: "A cooler red with a blue undertone. Crimson is the colour of our tailoring: exact and confident.",
  },
  {
    id: "cherry",
    name: "Cherry",
    hex: "#D2042D",
    rgb: [210, 4, 45],
    ink: "#f8eee8",
    mood: "Playful, glossy, quick",
    texture: "Glazed ceramic and technical mesh",
    note: "Cherry is bright red on the edge of pink. It is what we use for everyday objects you pick up without thinking.",
  },
  {
    id: "ruby",
    name: "Ruby",
    hex: "#9B111E",
    rgb: [155, 17, 30],
    ink: "#f8eee8",
    mood: "Ceremonial, heirloom",
    texture: "Hand-embroidered silk and tulle",
    note: "Deep and jewel-cut, ruby is the red of ceremony, kept for the pieces meant to outlive a season.",
  },
  {
    id: "vermilion",
    name: "Vermilion",
    hex: "#E34234",
    rgb: [227, 66, 52],
    ink: "#1a0503",
    mood: "Luminous, alive",
    texture: "Satin, wax and light",
    note: "Ground from cinnabar for centuries, vermilion sits close to orange. It is the colour of embers, and our pieces that glow.",
  },
  {
    id: "garnet",
    name: "Garnet",
    hex: "#733635",
    rgb: [115, 54, 53],
    ink: "#f8eee8",
    mood: "Smoked, intimate",
    texture: "Threadwork and patinated leather",
    note: "A brown-tinged red in low light. Garnet is for the evening pieces and the bags carried with them.",
  },
  {
    id: "oxblood",
    name: "Oxblood",
    hex: "#4A0000",
    rgb: [74, 0, 0],
    ink: "#f8eee8",
    mood: "Grave, enduring",
    texture: "Full-grain leather and stoneware",
    note: "The darkest red we make, close to black in shadow. Oxblood is kept for leather and stoneware, things that age well.",
  },
];

export const shadeById = Object.fromEntries(shades.map((s) => [s.id, s])) as Record<ShadeId, Shade>;
