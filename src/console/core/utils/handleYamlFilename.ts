export function handleYamlFilename(filename: string): string {
  const yamlExtensions: string[] = ['.yaml', '.yml'];
  const hasExtension: boolean = yamlExtensions.some((extension) => filename.toLowerCase().endsWith(extension));

  if (hasExtension) {
    return filename;
  }

  return `${filename}.yaml`;
}
