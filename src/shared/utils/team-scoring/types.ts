// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace NResult {
  export type TDelta = {
    id: number;
    speed: number | null;
    delta: number | null;
    prev: number | null;
    next: number | null;
    isSensed: boolean;
  };
  export type TDates = {
    average: number;
    worst: number;
    best: number;
    sensedAverage: number;
  };
  export type TOutput = {
    sortedSpeeds: {
      v: number;
      id: number;
    }[];
    delta: {
      items: TDelta[];
      min: number;
      max: number;
    };
    sensed: {
      counter: number;
      speedValues: number[];
      averageSpeed: number;
      correctedEstimate?: number;
    };
    dates: TDates | null;
    sensibility: number;
  };
  export type TSensedInfo = {
    counter: number;
    speedValues: number[];
    averageSpeed: number;
    deltasInfo: {
      all: TDelta[];
      min: number;
      max: number;
    };
  }
}
