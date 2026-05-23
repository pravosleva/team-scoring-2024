/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-explicit-any */
// import { ECountryCode } from '~/common/xstate/stepMachine'

export namespace NSP {
  export enum ECondition {
    C = 'C',
    D = 'D',
    NC = 'NC',
  }
  export type TStandartMinimalResponse = {
    ok: boolean;
    message?: string;
  };

  export type TPhone = {
    vendor?: string;
    type?: string;
    model?: string;
    memory?: string;
    memory_choices: string[];
    color?: string;
    color_choices: {
      [key: string]: string[];
    };
    // find_my_iphone: any;
  }
  export type TSubcidyPricesObject = {
    [key: string]: {
      [key: string]: {
        [key: string]: number;
      };
    };
  };
  export type TSubcidy = {
    prices: TSubcidyPricesObject;
    vendor: string;
    model: string;
    title: string;
    default_variant_id?: number;
  };

  export type TImeiResponse = {
    ok: boolean;
    message?: string;

    phone: TPhone;
    imei: string;
    currency: string;
    possible_prices: {
      [key: string]: {
        [key: string]: {
          [key: string]: number;
        };
      };
    };
    possible_subsidies: TSubcidy[];
    photo?: string | null;
    id: number;
    show_warning: boolean;
    raw_data: string;
    analytics_session_id: number;
    seconds_since_analytics_session_started: string; // '2022-09-15T13:06+03:00'

    // NOTE: New
    go_to_final_step?: boolean;
    condition?: string;
    condition_limit_reason?: string;
  };
  export type TCheckFMIPResponse = {
    ok: boolean; // NOTE: true -> FMIP on; false -> FMIP off;
    message?: string;
  }
  export type TExampleResponse = {
    ok: boolean;
    message?: string;

    currency: string; // 'RUB'
    price: number;
    id: number;
    condition: string; // 'NC'
    sp_condition: string; // 'n_grade_best'
    nine_photos_mode: string; // 'lite'
    subsidies: any[]; // TODO
    sim_check_enabled: boolean;
  };
  export type TAcceptResponse = {
    ok: boolean;
    message?: string;
  };
  export type TPhotoLinkResponse = {
    ok: boolean;
    qr: string;
    short_url: string;
    qr_url: string;
  };
  export type TPhotoStatusResponse = {
    ok: boolean;
    message?: string;

    started: boolean;
    // TODO: Declare all statuses here
    status: 'ok' | 'not_checked' | 'fake' | 'bad_quality'; // NOTE: Чтоб крутилка исчезла и флоу пошел дальше
    photo_states: {
      // TODO: Declare all statuses here
      [key: string]: 'not_checked';
    };
    loop: boolean;
    // TODO: Declare all condition vals here
    condition: 'C' | 'D' | 'NC';
    // TODO: Wtf is this?
    condition_limit: null | any;
    // TODO: Declare all condition_limit_reason vals here
    condition_limit_reason: null | 'no_defects';
    is_condition_limit_violated: boolean;
  };

  // NOTE: https://t.me/c/1615277747/4221
  export type TUserDataResponse = {
    ok: boolean;
    message?: string;

    // NOTE: Данные для отображения в ui:
    user_data: {
      partner: string;
      display_name: string;
    };

    // NOTE: Перечислены достойные внимания фичи (по мере доработки флоу)
    features: {
      // NOTE: Phone number mask
      // country_code: ECountryCode;

      // NOTE: Выбор типа устройства [Смартфоны / Планшеты] or [Смарт-часы]
      smartwatch_allowed?: boolean;

      // NOTE: IS_TRYING_ADD_CARD_FEATURE_ENABLED
      // partner_is_sberlike: boolean;

      // NOTE: IS_PARTNER_KZLIKE -(не важно)
      // t_require_iin: boolean;

      // NOTE: IS_DIRECT_BUYOUT_VERIFIED
      // t_direct_buyout_verified_via_api: boolean;

      // NOTE: IS_OFFLINE_BUYOUT_SMS_ENABLED
      // t_offline_buyout_sms: boolean;
    }
  };


}
