/* eslint-disable @typescript-eslint/no-namespace */
// import { getBaseUrl } from '~/middleware/context/utils';
import { getValidateResult } from '~/shared/utils/getValidateResult';
// import {
//   NSFileTemp,
//   rules as dmsPolicyInfoRules,
// } from '~/middleware/context/utils/file_temp';
import { getRandomString } from '~/shared/utils/string-ops';
import { getHumanReadableSize, getBytesFromMiB } from '~/shared/utils/number-ops';
import { delay } from '~/shared/utils/promise-ops'

export enum ApiResponseStatus {
  Success = 'Success',
  Fail = 'Fail'
}
export interface IBaseResponse<TData> {
  data?: TData;
  status: ApiResponseStatus;
  requestId: string;
  success?: boolean;
  message?: string;
}
export namespace NSFileTemp {
  export type TResponseData = {
    fileStoreId: string;
    originalFileName: string;
    mimeType: string;
  };
  export type TBaseResponse = IBaseResponse<TResponseData>;
}

const dmsPolicyInfoRules = {}

export const uploadFile = async ({ input }: {
  input: {
    file: File | null;
  };
}): Promise<{
  ok: boolean;
  message?: string;
  original?: NSFileTemp.TBaseResponse;
  about: {
    size: number;
    dontAllowRetry?: boolean;
    fileName: string;
    previewUrl: string;
  };
}> => {
  if (!input.file) {
    throw new Error('Не удалось распознать файл');
  }

  // -- NOTE: [UPLOAD_FILE_SIZE_LIMIT] 2/2 Before sending
  const limitMiB = 25;
  const limitB = getBytesFromMiB(limitMiB);
  const sizeB = input.file.size;
  if (sizeB > limitB) {
    throw new Error(`Файл слишком большой! ${getHumanReadableSize({ bytes: input.file.size, decimals: 0 })} (лимит: ${limitMiB} MiB)`);
  }
  // --

  const dataForRequest = new FormData();
  dataForRequest.append('file', input.file, `${input.file.name}`);

  const response: {
    ok: boolean;
    status: number;
    responseBody: NSFileTemp.TBaseResponse;
  } = await delay({ ms: 3000 })
    .then(() => ({
      ok: true,
      status: 200,
      responseBody: {
        data: {
          fileStoreId: getRandomString(7),
          originalFileName: 'filename-example',
          mimeType: 'mimeType-example',
        },
        status: ApiResponseStatus.Success,
        requestId: 'aaa01',
        success: true,
        message: 'Ok',
      },
    }))

  if (!response.ok) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    throw new Error(`Ошибка сервиса: ${response.status || response?.statusText || response?.message || 'Не удалось отправить'}`);
  }

  const validatedResult = response.responseBody
    ? getValidateResult({
      rules: dmsPolicyInfoRules,
      event: response.responseBody,
    })
    : {
      ok: false,
      message: `Response status: ${response.status}`,
    };

  if (!validatedResult.ok) {
    throw new Error(validatedResult.message || 'No message (impossible)');
  }

  return {
    ...validatedResult,
    original: response.responseBody,
    about: {
      size: input.file.size,
      fileName: input.file.name,
      previewUrl: URL.createObjectURL(input.file)
    },
  };
};
