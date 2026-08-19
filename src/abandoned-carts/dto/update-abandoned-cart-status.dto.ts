import { IsIn } from "class-validator";

export class UpdateAbandonedCartStatusDto {
  @IsIn(["open", "contacted", "discarded"])
  status!: "open" | "contacted" | "discarded";
}
