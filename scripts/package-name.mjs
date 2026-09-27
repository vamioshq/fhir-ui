// npm package that an import specifier resolves to: "@base-ui/react/combobox" -> "@base-ui/react".
export function packageName(specifier) {
  const parts = specifier.split("/");
  return specifier.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0];
}
