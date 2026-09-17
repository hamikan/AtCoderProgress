import type { z } from 'zod';

import type { rawSubmissionSchema } from './schemas';

export type RawSubmission = z.infer<typeof rawSubmissionSchema>;

export interface SubmissionResources {
  submissions: Array<RawSubmission>;
}
