/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-namespace */

// NOTE: Should be refactored (any)

export namespace NValidate {
  export type TRules = {
    [key: string]: {
      isRequired: boolean;
      validate: <TData>(ps: {
        value: TData;
        event: any;
      }) => ({
        ok: boolean;
        message?: string;
      });
    };
  };
  export type TResult = {
    ok: boolean;
    message?: string;
  };
}
