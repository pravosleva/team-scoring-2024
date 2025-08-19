export type TStandartSections = {
  [key: string]: {
    items: string[];
    comment?: string;
  };
};

export type TSections = {
  estimated: {
    items: string[];
    comment?: string;
  };
  realistic: {
    items: string[];
    comment?: string;
  };
  [key: string]: {
    items: string[];
    comment?: string;
  };
};
