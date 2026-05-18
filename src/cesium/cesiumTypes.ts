import type { AppError, QualityProfile } from "../shared/domain";

export type ViewerCreateOptions = {
  token?: string;
  container: HTMLElement;
  initialQuality: QualityProfile;
};

export type ViewerCreateResult =
  | { status: "ready"; viewer: any }
  | { status: "missingToken"; message: string }
  | { status: "failed"; error: AppError };
