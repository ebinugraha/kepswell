import { parseAsString } from "nuqs/server";

export const karyawanParams = {
  search: parseAsString.withDefault("").withOptions({
    clearOnDefault: true,
  }),
};
