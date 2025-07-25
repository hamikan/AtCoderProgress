export interface Tag {
    id: number;
    name: string;
    isOfficial: boolean;
    createdById: string | null;
    createdAt: Date;
}