export interface TagStat {
  tagId: string;
  name: string;
  score: number;
  total: number;
  solved: number;
  type: 'official' | 'unofficial';
}
