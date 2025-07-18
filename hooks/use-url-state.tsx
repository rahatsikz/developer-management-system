"use client";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";

type ParamRecord<T extends string> = Record<T, string>;

export function useUrlState<T extends string>(
  paramNames: T[],
  defaults: Partial<ParamRecord<T>> = {},
  normalizeEmpty = false
) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  //  getter
  const state = useMemo(() => {
    const result = {} as ParamRecord<T>;
    paramNames.forEach((key) => {
      const value = searchParams.get(key);
      if (value !== null) result[key] = value;
      else if (defaults[key] !== undefined) result[key] = defaults[key]!;
      else result[key] = "";
    });
    return result;
  }, [searchParams, defaults, paramNames]);

  // Setter

  const setState = useCallback(
    (updates: Record<string, string | null | undefined>, replace = false) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, val]) => {
        if (val == null || (normalizeEmpty && val === "")) {
          params.delete(key);
        } else {
          params.set(key, val);
        }
      });

      const queries = params.toString();
      const url = pathname + (queries ? `?${queries}` : "");
      router[replace ? "replace" : "push"](url, {
        scroll: false,
      });
    },
    [searchParams, pathname, router, normalizeEmpty]
  );

  // delete
  const deleteState = useCallback(
    (key: string) => setState({ [key]: null }, true),
    [setState]
  );

  return { state, setState, deleteState };
}
