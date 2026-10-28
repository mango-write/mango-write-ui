export interface UserSelectOption extends Record<string, unknown> {
  id: string;
  name: string;
  avatar?: string | null;
  email?: string | null;
}
