/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-namespace */

// NOTE: Should be refactored (any)

export namespace NValidate {
  export type TRule = {
      isRequired: boolean;
      validate: <TData>(ps: {
        value: TData;
        event: any;
        key: string;
      }) => ({
        ok: boolean;
        message?: string;
      });
    };
  export type TRules = {
    [key: string]: TRule;
  };
  export type TResult = {
    ok: boolean;
    message?: string;
  };
}
