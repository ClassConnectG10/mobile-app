import { ForumOrderBy } from "@/types/forum";
import { BiMap } from "../bimap";

export const ORDER_OPTIONS = new BiMap([
  ["Más recientes", ForumOrderBy.RECENT],
  ["Popularidad", ForumOrderBy.POPULAR],
]);
