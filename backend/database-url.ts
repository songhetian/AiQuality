type DatabaseEnv = Record<string, string | undefined>;

const hasTemplatePlaceholder = (value: string) => /\$\{[^}]+\}/.test(value);

const encodeSegment = (value: string) => encodeURIComponent(value);

export function resolveDatabaseUrl(env: DatabaseEnv): string {
  const directUrl = String(env.DATABASE_URL || '').trim();

  if (directUrl && !hasTemplatePlaceholder(directUrl)) {
    return directUrl;
  }

  const host = String(env.DB_HOST || '127.0.0.1').trim();
  const port = String(env.DB_PORT || '3307').trim();
  const user = String(env.DB_USER || 'root').trim();
  const password = String(env.DB_PASSWORD || '').trim();
  const database = String(env.DB_NAME || '').trim();

  if (!database) {
    throw new Error('DB_NAME 未配置，无法生成 DATABASE_URL');
  }

  if (!/^\d+$/.test(port)) {
    throw new Error(`DB_PORT 配置非法: ${port}`);
  }

  return `mysql://${encodeSegment(user)}:${encodeSegment(password)}@${host}:${port}/${database}`;
}
