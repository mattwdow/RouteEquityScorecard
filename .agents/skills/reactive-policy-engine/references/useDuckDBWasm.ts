/**
 * useDuckDBWasm.ts — Reference Template for /reactive-policy-engine
 *
 * Initializes @duckdb/duckdb-wasm in the browser using jsDelivr CDN bundles
 * wrapped in a local Blob Worker URL. Completely bypasses Next.js Webpack WASM
 * bundling issues and Cross-Origin Worker security exceptions.
 */

import { useState, useEffect } from 'react';
import * as duckdb from '@duckdb/duckdb-wasm';

export const useDuckDBWasm = () => {
  const [db, setDb] = useState(null as duckdb.AsyncDuckDB | null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState(null as string | null);

  useEffect(() => {
    let active = true;

    const initDb = async () => {
      if (db || isInitializing) return;
      setIsInitializing(true);

      try {
        const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();
        const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);

        const workerURL = URL.createObjectURL(
          new Blob([`importScripts("${bundle.mainWorker!}");`], { type: 'text/javascript' })
        );

        const worker = new Worker(workerURL);
        const logger = new duckdb.ConsoleLogger();
        const newDb = new duckdb.AsyncDuckDB(logger, worker);

        await newDb.instantiate(bundle.mainModule, bundle.pthreadWorker);

        if (active) {
          setDb(newDb);
          setIsInitializing(false);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to initialize DuckDB-Wasm');
          setIsInitializing(false);
        }
      }
    };

    initDb();
    return () => {
      active = false;
    };
  }, []);

  return { db, isInitializing, error };
};
