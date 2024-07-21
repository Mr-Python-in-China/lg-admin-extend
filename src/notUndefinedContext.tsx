import React, { createContext, useContext } from 'react';

type notUndefinedContext<T> = React.Context<T | undefined>;

export function createNotUndefinedContext<T extends Exclude<any, undefined>>(
  defaultValue?: T
): notUndefinedContext<T> {
  return createContext(defaultValue);
}

export function useNotUndefinedContext<T>(context: notUndefinedContext<T>): T {
  const v = useContext(context);
  if (v === undefined)
    throw new ReferenceError(
      `NotUndefinedContext ${context.displayName} is not defined`
    );
  return v;
}
