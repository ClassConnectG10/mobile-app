import { BiMap } from "../bimap";
import { FeedbackType } from "@/types/course";

export const FEEDBACK_TYPES_OPTIONS = new BiMap([
  ["Todos", FeedbackType.ALL],
  ["Aprobado", FeedbackType.PASSED],
  ["Desaprobado", FeedbackType.FAILED],
]);
