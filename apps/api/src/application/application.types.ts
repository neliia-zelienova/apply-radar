import { Application } from './entities/application.entity';
import { Interview } from 'src/interview/entities/interview.entity';

/** Raw Prisma row before flattening _count / interviews. */
export interface ApplicationDbRow
  extends Omit<Application, 'interviews' | 'interviewCount'> {
  _count: { interviews: number };
  interviews?: Array<{ interview: Interview }>;
}

/** Raw Prisma join row before flattening. */
export interface UserApplicationDbRow {
  userId: string;
  applicationId: string;
  application: ApplicationDbRow;
}

/** Flattened application with computed interviewCount. */
export interface ApplicationResult extends Application {
  interviewCount: number;
}

/** findAll envelope — preserves userId/applicationId alongside the flattened application. */
export interface UserApplicationResult {
  userId: string;
  applicationId: string;
  application: ApplicationResult;
}
