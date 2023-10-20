declare namespace NodeJS {
  interface ProcessEnv {
    GA_ACCOUNT_ID: string;
    MIXPANEL_TOKEN: string;
  }

  interface Global {}
}
