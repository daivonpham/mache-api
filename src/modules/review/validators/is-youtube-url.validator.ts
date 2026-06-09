import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";

const YOUTUBE_URL_PATTERN =
  /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:[?&].*)?$|^[a-zA-Z0-9_-]{11}$/;

@ValidatorConstraint({ name: "isYouTubeUrl", async: false })
export class IsYouTubeUrlConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (value == null || value === "") return true;
    if (typeof value !== "string") return false;
    return YOUTUBE_URL_PATTERN.test(value.trim());
  }

  defaultMessage(): string {
    return "Link YouTube không hợp lệ";
  }
}

export function IsYouTubeUrl(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsYouTubeUrlConstraint,
    });
  };
}
