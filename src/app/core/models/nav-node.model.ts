export interface NavNode {
  id: string;
  label: string;
  slug: string;
  children?: NavNode[];
  icon?: string;
  locked?: boolean;
}
