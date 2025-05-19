import { BiMap } from "../bimap";

// HUMANITIES = "HUMANITIES";
// BUSINESS = "BUSINESS";
// ENGINEERING = "ENGINEERING";
// HEALTH_SCIENCES = "HEALTH_SCIENCES";
// LAW = "LAW";
// ECONOMICS = "ECONOMICS";
// PSYCHOLOGY = "PSYCHOLOGY";
// EDUCATION = "EDUCATION";

export const LEVELS = new BiMap([
  ["Primaria", "PRIMARY"],
  ["Secundaria", "SECONDARY"],
  ["Universitario", "UNIVERSITY"],
  ["Postgrado", "POSTGRADUATE"],
]);

export const CATEGORIES = new BiMap([
  ["Arte", "ARTS"],
  ["Biología", "NATURAL_SCIENCES"],
  ["Ciencias Sociales", "SOCIAL_SCIENCES"],
  ["Educación Física", "PHYSICAL_EDUCATION"],
  ["Física", "PHYSICAL_SCIENCES"],
  ["Geografía", "GEOGRAPHY"],
  ["Historia", "HISTORY"],
  ["Idiomas", "LANGUAGES"],
  ["Matemáticas", "MATHEMATICS"],
  ["Música", "MUSIC"],
  ["Otros", "OTHER"],
  ["Programación", "COMPUTER_SCIENCE"],
  // ["Química", "CHEMISTRY"],
  ["Robótica", "ROBOTICS"],
  ["Tecnología", "TECHNOLOGY"],
]);

export const MODALITIES = new BiMap([
  ["Presencial", "PRESENCIAL"],
  ["Virtual", "VIRTUAL"],
  ["Híbrido", "HIBRIDO"],
]);

export const defaultLevel = "UNIVERSITY";
export const defaultCategory = "OTHER";
export const defaultModality = "VIRTUAL";
