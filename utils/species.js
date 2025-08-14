/* minimal safety sheet*/

//normalize input as much as ppossible
export function normalizeName(input) {
  return String(input || "")
    .toLowerCase()
    .replace(/\s+/g, " ") //regex for spaces
    .trim();
}
/////////////////////////////////////////////////////////////////NAMES
const SYNONYMS = new Map([
  //dummy data edibles
  // Morel (Morchella spp.)
  ["morel", "morchella spp."],
  ["true morel", "morchella spp."],
  ["morchella", "morchella spp."],
  ["yellow morel", "morchella spp."],
  ["black morel", "morchella spp."],

  // Chanterelle (Cantharellus cibarius)
  ["chanterelle", "cantharellus cibarius"],
  ["girolle", "cantharellus cibarius"],
  ["golden chanterelle", "cantharellus cibarius"],

  // Oyster (Pleurotus ostreatus)
  ["oyster", "pleurotus ostreatus"],
  ["oyster mushroom", "pleurotus ostreatus"],
  ["tree oyster", "pleurotus ostreatus"],

  // Shiitake (Lentinula edodes)
  ["shiitake", "lentinula edodes"],
  ["shitake", "lentinula edodes"],
  ["black forest mushroom", "lentinula edodes"],

  // Porcini (Boletus edulis)
  ["porcini", "boletus edulis"],
  ["king bolete", "boletus edulis"],
  ["cep", "boletus edulis"],
  ["penny bun", "boletus edulis"],

  // Enoki (Flammulina filiformis)
  ["enoki", "flammulina filiformis"],
  ["enokitake", "flammulina filiformis"],
  ["golden needle mushroom", "flammulina filiformis"],

  // Lion's Mane (Hericium erinaceus)
  ["lion's mane", "hericium erinaceus"],
  ["lions mane", "hericium erinaceus"],
  ["bearded tooth", "hericium erinaceus"],
  ["pom pom mushroom", "hericium erinaceus"],

  // Turkey Tail (Trametes versicolor)
  ["turkey tail", "trametes versicolor"],
  ["cloud mushroom", "trametes versicolor"],
  ["coriolus versicolor", "trametes versicolor"],

  // Maitake (Grifola frondosa)
  ["maitake", "grifola frondosa"],
  ["hen of the woods", "grifola frondosa"],

  // Black Trumpet (Craterellus cornucopioides)
  ["black trumpet", "craterellus cornucopioides"],
  ["horn of plenty", "craterellus cornucopioides"],
  ["black chanterelle", "craterellus cornucopioides"],

  //aditional edibles
  ["puffball", "calvatia gigantea"],
  ["giant puffball", "calvatia gigantea"],
  ["calvatia gigantea", "calvatia gigantea"],

  ["chicken of the woods", "laetiporus sulphureus"],
  ["chicken mushroom", "laetiporus sulphureus"],
  ["sulphur shelf", "laetiporus sulphureus"],

  ["cauliflower mushroom", "sparassis crispa"],
  ["sparassis", "sparassis crispa"],
  ["sparassis crispa", "sparassis crispa"],

  ["wood blewit", "lepista nuda"],
  ["blewit", "lepista nuda"],
  ["lepista nuda", "lepista nuda"],
  ["clitocybe nuda", "lepista nuda"],

  ["hedgehog mushroom", "hydnum repandum"],
  ["sweet tooth", "hydnum repandum"],
  ["hydnum repandum", "hydnum repandum"],

  ["shaggy mane", "coprinus comatus"],
  ["shaggy ink cap", "coprinus comatus"],
  ["coprinus comatus", "coprinus comatus"],

  ["matsutake", "tricholoma matsutake"],
  ["pine mushroom", "tricholoma matsutake"],
  ["tricholoma matsutake", "tricholoma matsutake"],

  ["birch bolete", "leccinum scabrum"],
  ["leccinum scabrum", "leccinum scabrum"],

  ["lobster mushroom", "hypomyces lactifluorum"],
  ["hypomyces lactifluorum", "hypomyces lactifluorum"],

  // the deadly/fatal
  ["death cap", "amanita phalloides"],
  ["deathcap", "amanita phalloides"],
  ["amanita phalloides", "amanita phalloides"],

  ["destroying angel", "amanita virosa"],
  ["destroying angels", "amanita virosa"],
  ["amanita virosa", "amanita virosa"],
  ["amanita bisporigera", "amanita bisporigera"],
  ["amanita ocreata", "amanita ocreata"],
  ["fool's mushroom", "amanita verna"],
  ["amanita verna", "amanita verna"],

  ["deadly galerina", "galerina marginata"],
  ["funeral bell", "galerina marginata"],
  ["galerina marginata", "galerina marginata"],

  ["deadly webcap", "cortinarius rubellus"],
  ["webcap", "cortinarius rubellus"],
  ["cortinarius rubellus", "cortinarius rubellus"],
  ["cortinarius orellanus", "cortinarius orellanus"],

  ["poison fire coral", "podostroma cornu-damae"],
  ["fire coral mushroom", "podostroma cornu-damae"],
  ["podostroma cornu-damae", "podostroma cornu-damae"],

  ["conocybe filaris", "conocybe filaris"],

  ["patouillard's fiber cap", "inocybe patouillardii"],
  ["inocybe patouillardii", "inocybe patouillardii"],
  ["fool's funnel", "clitocybe rivulosa"],
  ["clitocybe rivulosa", "clitocybe rivulosa"],
  ["clitocybe dealbata", "clitocybe dealbata"],

  //Deadly (or coma) look a likes for edibles//////lookalikes
  ["false morel", "gyromitra esculenta"],
  ["gyromitra", "gyromitra esculenta"],
  ["gyromitra esculenta", "gyromitra esculenta"],
  ["gyromitra infula", "gyromitra infula"],

  ["jack-o-lantern", "omphalotus illudens"],
  ["jack o lantern", "omphalotus illudens"],
  ["omphalotus illudens", "omphalotus illudens"],
  ["omphalotus olearius", "omphalotus olearius"],

  // Enoki look-alike -> Deadly Galerina
  ["galerina", "galerina marginata"],
  ["funeral bells", "galerina marginata"],
]);

///////////////////////////////////////////////////////FACT SHEET
export const SPECIES_META = {
  //EDIBLES
  "morchella spp.": {
    edible: true,
    deadly: false,
    toxins: [],
    syndrome: null,
    notes:
      "True morels; always cook. Do not confuse with false morels (Gyromitra spp.).",
    deadly_lookalikes: ["gyromitra esculenta", "gyromitra infula"],
  },
  "cantharellus cibarius": {
    edible: true,
    deadly: false,
    toxins: [],
    syndrome: null,
    notes: "Chanterelles (golden). False look‑alike: jack‑o'-lantern.",
    deadly_lookalikes: ["omphalotus illudens", "omphalotus olearius"],
  },
  "pleurotus ostreatus": {
    edible: true,
    deadly: false,
    toxins: [],
    syndrome: null,
    notes: "Oyster mushroom; common on hardwoods.",
    deadly_lookalikes: [],
  },
  "lentinula edodes": {
    edible: true,
    deadly: false,
    toxins: [],
    syndrome: null,
    notes: "Shiitake; wild mainly in temperate E. Asia; globally cultivated.",
    deadly_lookalikes: [],
  },
  "boletus edulis": {
    edible: true,
    deadly: false,
    toxins: [],
    syndrome: null,
    notes:
      "Porcini/cep; avoid boletes with red pores or blue bruising if unsure.",
    deadly_lookalikes: [],
  },
  "flammulina filiformis": {
    edible: true,
    deadly: false,
    toxins: [],
    syndrome: null,
    notes:
      "Enoki (cultivated form). Small brown LBMs can be dangerous; see Galerina.",
    deadly_lookalikes: ["galerina marginata"],
  },
  "hericium erinaceus": {
    edible: true,
    deadly: false,
    toxins: [],
    syndrome: null,
    notes: "Lion’s Mane; distinctive teeth; few mix-ups.",
    deadly_lookalikes: [],
  },
  "trametes versicolor": {
    edible: true,
    deadly: false,
    toxins: [],
    syndrome: null,
    notes: "Turkey Tail; tough polypore, used more as tea/extract.",
    deadly_lookalikes: [],
  },
  "laetiporus sulphureus": {
    edible: true,
    deadly: false,
    toxins: [],
    syndrome: null,
    notes:
      "Highly regarded edible mushroom, tastes like chicken when cooked. Must be well-cooked before eating.",
    deadly_lookalikes: [],
  },

  "grifola frondosa": {
    edible: true,
    deadly: false,
    toxins: [],
    syndrome: null,
    notes: "Maitake/Hen of the Woods; clustered rosette at oak bases.",
    deadly_lookalikes: [],
  },
  "craterellus cornucopioides": {
    edible: true,
    deadly: false,
    toxins: [],
    syndrome: null,
    notes: "Black Trumpet; funnel-shaped, fragrant.",
    deadly_lookalikes: [],
  },
  "calvatia gigantea": {
    edible: true,
    deadly: false,
    toxins: [],
    syndrome: null,
    notes: "Giant puffball; only when pure white inside.",
    deadly_lookalikes: [],
  },
  "sparassis crispa": {
    edible: true,
    deadly: false,
    toxins: [],
    syndrome: null,
    notes: "Cauliflower mushroom; large, frilly, at conifer bases.",
    deadly_lookalikes: [],
  },
  "lepista nuda": {
    edible: true,
    deadly: false,
    toxins: [],
    syndrome: null,
    notes:
      "Wood blewit; lilac tones; avoid brown‑spored Cortinarius look‑alikes.",
    deadly_lookalikes: [],
  },
  "hydnum repandum": {
    edible: true,
    deadly: false,
    toxins: [],
    syndrome: null,
    notes: "Hedgehog mushroom; spines instead of gills; distinctive.",
    deadly_lookalikes: [],
  },
  "coprinus comatus": {
    edible: true,
    deadly: false,
    toxins: [],
    syndrome: null,
    notes: "Shaggy mane/ink cap; eat young; deliquesces quickly.",
    deadly_lookalikes: [],
  },
  "tricholoma matsutake": {
    edible: true,
    deadly: false,
    toxins: [],
    syndrome: null,
    notes: "Matsutake; spicy aroma; habitat‑specific.",
    deadly_lookalikes: [],
  },
  "leccinum scabrum": {
    edible: true,
    deadly: false,
    toxins: [],
    syndrome: null,
    notes: "Birch bolete; always cook thoroughly.",
    deadly_lookalikes: [],
  },
  "hypomyces lactifluorum": {
    edible: true,
    deadly: false,
    toxins: [],
    syndrome: null,
    notes:
      "Lobster mushroom; Hypomyces‑parasitized host; inspect for off odors.",
    deadly_lookalikes: [],
  },

  ///DEADLY / FATAL GROUP
  "amanita phalloides": {
    edible: false,
    deadly: true,
    toxins: ["amatoxins (α‑amanitin, etc.)"],
    syndrome: "Delayed hepatotoxicity → acute liver failure",
    notes: "Death cap; leading cause of fatal mushroom poisonings.",
    deadly_lookalikes: [],
  },
  "amanita virosa": {
    edible: false,
    deadly: true,
    toxins: ["amatoxins"],
    syndrome: "Hepatorenal failure",
    notes: "Destroying angel (Europe).",
    deadly_lookalikes: [],
  },
  "amanita bisporigera": {
    edible: false,
    deadly: true,
    toxins: ["amatoxins"],
    syndrome: "Hepatorenal failure",
    notes: "Destroying angel (N. America).",
    deadly_lookalikes: [],
  },
  "amanita ocreata": {
    edible: false,
    deadly: true,
    toxins: ["amatoxins"],
    syndrome: "Hepatic failure",
    notes: "Western destroying angel.",
    deadly_lookalikes: [],
  },
  "amanita verna": {
    edible: false,
    deadly: true,
    toxins: ["amatoxins"],
    syndrome: "Hepatic failure",
    notes: "Fool’s mushroom (spring).",
    deadly_lookalikes: [],
  },
  "galerina marginata": {
    edible: false,
    deadly: true,
    toxins: ["amatoxins"],
    syndrome: "Hepatic failure",
    notes: "Deadly Galerina; small wood‑rotting LBM.",
    deadly_lookalikes: [],
  },
  "cortinarius rubellus": {
    edible: false,
    deadly: true,
    toxins: ["orellanine"],
    syndrome: "Delayed renal failure",
    notes: "Deadly webcap; orange‑brown with cortina remnants.",
    deadly_lookalikes: [],
  },
  "cortinarius orellanus": {
    edible: false,
    deadly: true,
    toxins: ["orellanine"],
    syndrome: "Delayed renal failure",
    notes: "Fool’s webcap.",
    deadly_lookalikes: [],
  },
  "podostroma cornu-damae": {
    edible: false,
    deadly: true,
    toxins: ["trichothecenes (satratoxins)"],
    syndrome: "Multi‑organ failure",
    notes: "Poison fire coral; SE Asia/E Asia.",
    deadly_lookalikes: [],
  },
  "conocybe filaris": {
    edible: false,
    deadly: true,
    toxins: ["amatoxins"],
    syndrome: "Hepatic failure",
    notes: "Also known as Pholiotina rugosa in some sources.",
    deadly_lookalikes: [],
  },
  "inocybe patouillardii": {
    edible: false,
    deadly: true,
    toxins: ["muscarine (very high)"],
    syndrome: "Cholinergic crisis; rare fatalities historically",
    notes: "Patouillard’s fiber cap.",
    deadly_lookalikes: [],
  },
  "clitocybe rivulosa": {
    edible: false,
    deadly: true,
    toxins: ["muscarine (high)"],
    syndrome: "Severe muscarinic poisoning; fatalities reported historically",
    notes: "Fool’s funnel (lawn).",
    deadly_lookalikes: [],
  },
  "clitocybe dealbata": {
    edible: false,
    deadly: true,
    toxins: ["muscarine (high)"],
    syndrome: "Severe muscarinic poisoning; fatalities reported historically",
    notes: "Often confused with harmless lawn mushrooms.",
    deadly_lookalikes: [],
  },
  ////////////////////////DEADLY LOOK‑ALIKES for edibles
  "gyromitra esculenta": {
    edible: false,
    deadly: true,
    toxins: ["gyromitrin → MMH"],
    syndrome: "Hepatic/CNS toxicity; seizures",
    notes: "False morel; documented deaths.",
    deadly_lookalikes: [],
  },
  "gyromitra infula": {
    edible: false,
    deadly: true,
    toxins: ["gyromitrin → MMH"],
    syndrome: "Hepatic/CNS toxicity",
    notes: "Also a false morel species.",
    deadly_lookalikes: [],
  },
  "omphalotus illudens": {
    edible: false,
    deadly: true,
    toxins: ["illudin S (sesquiterpenes)"],
    syndrome: "Severe GI; coma cases reported",
    notes: "Jack‑o’-lantern (North America). Bioluminescent gills.",
    deadly_lookalikes: [],
  },
  "omphalotus olearius": {
    edible: false,
    deadly: true,
    toxins: ["illudin S"],
    syndrome: "Severe GI; coma cases reported",
    notes: "Mediterranean jack‑o’-lantern.",
    deadly_lookalikes: [],
  },
};

/*look up name, if found, return the standard/resolve name stored in map.
   If not found, just return the normalized name itself*/
export function resolveName(input) {
  const key = normalizeName(input);
  return SYNONYMS.get(key) || key;
}
//get the localSafety info (fact sheet) for a resolve species name
export function localSafety(input) {
  const resolved = resolveName(input);
  return SPECIES_META[resolved] || null;
}

// 1 turn input into a string. If it's null/undefined, make it an empty string ("")
// 2 cut whitespace from the start and end (.trim())
// 3 everything lowercase (.toLowerCase())
// 4 replace multiple spaces with a single space (now using regexe(/\s+/g, " ")
