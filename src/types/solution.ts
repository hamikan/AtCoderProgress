export interface Solution {
    id: string;
    userId: string | null;
    problemId: string;
    content: string | null;
    isPublic: boolean;
    status: 'SELF_AC' | 'EXPLANATION_AC' | 'REVIEW_AC' | 'TRYING';
    solvedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}