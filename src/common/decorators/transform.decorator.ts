import { Transform } from "class-transformer";

export function ToBoolean(): PropertyDecorator {
  return Transform(({ value }) => {
    if (value === "true" || value === true || value === 1 || value === "1") {
      return true;
    }
    if (value === "false" || value === false || value === 0 || value === "0") {
      return false;
    }
    return value;
  });
}

export function ToNumber(): PropertyDecorator {
  return Transform(({ value }) => {
    if (value === null || value === undefined || value === "") {
      return value;
    }
    const num = Number(value);
    return isNaN(num) ? value : num;
  });
}

export function ToString(): PropertyDecorator {
  return Transform(({ value }) => {
    if (value === null || value === undefined) {
      return value;
    }
    if (typeof value === "string") {
      return value.trim();
    }
    return String(value);
  });
}

export function ToArray(): PropertyDecorator {
  return Transform(({ value }) => {
    if (value === null || value === undefined) {
      return value;
    }
    if (Array.isArray(value)) {
      return value;
    }
    if (typeof value === "string") {
      return value.split(",").map((item) => item.trim());
    }
    return [value];
  });
}

export function ToUTC00(): PropertyDecorator {
  return Transform(({ value }) => {
    if (value === null || value === undefined || value === "") {
      return value;
    }

    if (typeof value === "string") {
      let timeString = value.trim().replace(" ", "T");
      if (!/(Z|[+-]\d{2}(:\d{2})?)$/.test(timeString)) {
        timeString = `${timeString}+07:00`;
      }

      const date = new Date(timeString);
      return isNaN(date.getTime()) ? value : date;
    }

    const date = new Date(value);
    return isNaN(date.getTime()) ? value : date;
  });
}
