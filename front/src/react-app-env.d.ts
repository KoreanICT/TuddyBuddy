/// <reference types="react-scripts" />

declare const process: {
  env: {
    readonly REACT_APP_BACK_END_URL: string;
  };
};

declare module '*.css';

declare module 'fullpage.js';