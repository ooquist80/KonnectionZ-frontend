export function hasScope(scopes: string[], targetScope: string): boolean {
  return scopes.some((scope) => scope.split(' ').includes(targetScope))
}

export function hasAdminScope(scopes: string[]): boolean {
  return hasScope(scopes, 'user:admin')
}

export function hasGamemasterScope(scopes: string[]): boolean {
  return hasScope(scopes, 'user:gamemaster')
}

export function formatScopeLabel(scope: string): string {
  const label = scope.includes(':') ? scope.split(':').slice(1).join(':') : scope

  return label
    .split(/[-_\s:]+/)
    .filter((part) => part.length > 0)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}
