// Where published registry items live. Releases pin dependencies to their own tag.
export const REPOSITORY_RAW_URL = "https://raw.githubusercontent.com/vamioshq/fhir-ui";

export function registryBaseUrl(ref) {
  return `${REPOSITORY_RAW_URL}/${ref}/public`;
}

export const DEFAULT_REGISTRY_BASE_URL = registryBaseUrl("main");

export const RELEASE_TAG_PATTERN = /^v\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;
