import type { UserRole } from "../db/schema";

export interface localUser {
      id: string;
      clerkUserId: string;
      email: string;
      displayName: string | null;
      role: UserRole;
      createdAt: Date;
      updatedAt: Date;
    }