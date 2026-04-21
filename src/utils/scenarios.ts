import type { SavedScenario, SavedScenarioMap } from "../types/finance";
import { normalizeAnalysisContext } from "./analysisContext";

const STORAGE_KEY = "stratify-scenarios";

const canUseStorage = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const sortScenarios = (scenarios: SavedScenario[]) =>
  [...scenarios].sort(
    (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
  );

const writeScenarioMap = (scenarioMap: SavedScenarioMap) => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarioMap));
};

export const loadScenarioMap = (): SavedScenarioMap => {
  if (!canUseStorage()) {
    return {};
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEY);

  if (!rawValue) {
    return {};
  }

  try {
    const parsed = JSON.parse(rawValue) as SavedScenarioMap;

    return Object.fromEntries(
      Object.entries(parsed ?? {}).map(([moduleId, scenarios]) => [
        moduleId,
        Array.isArray(scenarios)
          ? scenarios.map((scenario) => ({
              ...scenario,
              context: normalizeAnalysisContext(scenario.context),
            }))
          : [],
      ]),
    );
  } catch {
    return {};
  }
};

export const createScenario = (
  scenarioMap: SavedScenarioMap,
  moduleId: string,
  name: string,
  inputs: Record<string, number>,
  context: SavedScenario["context"],
) => {
  const timestamp = new Date().toISOString();
  const scenario: SavedScenario = {
    id: crypto.randomUUID(),
    name,
    moduleId,
    createdAt: timestamp,
    updatedAt: timestamp,
    inputs,
    context,
  };

  const nextMap = {
    ...scenarioMap,
    [moduleId]: sortScenarios([...(scenarioMap[moduleId] ?? []), scenario]),
  };

  writeScenarioMap(nextMap);
  return nextMap;
};

export const updateScenario = (
  scenarioMap: SavedScenarioMap,
  scenarioId: string,
  name: string,
  inputs: Record<string, number>,
  context: SavedScenario["context"],
) => {
  const nextMap = Object.fromEntries(
    Object.entries(scenarioMap).map(([moduleId, scenarios]) => [
      moduleId,
      sortScenarios(
        scenarios.map((scenario) =>
          scenario.id === scenarioId
            ? {
                ...scenario,
                name,
                inputs,
                context,
                updatedAt: new Date().toISOString(),
              }
            : scenario,
        ),
      ),
    ]),
  );

  writeScenarioMap(nextMap);
  return nextMap;
};

export const duplicateScenario = (scenarioMap: SavedScenarioMap, scenario: SavedScenario) => {
  const timestamp = new Date().toISOString();
  const duplicatedScenario: SavedScenario = {
    ...scenario,
    id: crypto.randomUUID(),
    name: `${scenario.name} (copia)`,
    createdAt: timestamp,
    updatedAt: timestamp,
    inputs: { ...scenario.inputs },
    context: {
      ...scenario.context,
      tags: [...scenario.context.tags],
    },
  };

  const nextMap = {
    ...scenarioMap,
    [scenario.moduleId]: sortScenarios([
      ...(scenarioMap[scenario.moduleId] ?? []),
      duplicatedScenario,
    ]),
  };

  writeScenarioMap(nextMap);
  return nextMap;
};

export const removeScenario = (scenarioMap: SavedScenarioMap, scenarioId: string) => {
  const nextMap = Object.fromEntries(
    Object.entries(scenarioMap).map(([moduleId, scenarios]) => [
      moduleId,
      scenarios.filter((scenario) => scenario.id !== scenarioId),
    ]),
  );

  writeScenarioMap(nextMap);
  return nextMap;
};
