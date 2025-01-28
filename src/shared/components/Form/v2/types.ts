/* eslint-disable @typescript-eslint/no-explicit-any */
import { TOption } from '~/shared/components/CreatableAutocomplete'

export type TValue = string | boolean | number | TOption;

export type TScheme = {
  [key: string]: {
    specialKey?: string | number;
    isClearable?: boolean;
    initValue?: TValue | TOption;
    isReadOnly?: boolean;

    // type: 'number' | 'string' | 'date-ts' | 'multiline-text' | 'select-user' | 'creatable-autocomplete';
    type: 'rating' | 'list' | 'autocomplete' | React.InputHTMLAttributes<unknown>['type'];
    _selectCustomOpts?: {
      list?: TOption[];
      // _onCreate?: (val: TOption) => Promise<{ ok: boolean; message?: string; createdOption: TOption; }>;
    };

    label: string;
    gridSize: number;
    validator: ({ value, scheme, internalState }: {
      value: any;
      scheme: TScheme;
      internalState: {
        [key: string]: TValue | undefined;
      };
    }) => ({
      ok: boolean;
      message?: string;
      _isDisabled?: {
        value: boolean;
        reason?: string;
      };
    });
    isRequired?: boolean;
    nativeRules?: {
      placeholder?: string;
      // min: number | string;
      // max: number | string;
      maxLength?: number;
      minLength?: number;
    };
    onClear?: () => void;
  };
};
