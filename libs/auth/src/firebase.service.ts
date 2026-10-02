import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService {
  private readonly logger = new Logger(FirebaseService.name);

  async deleteUser(uid: string): Promise<void> {
    try {
      await admin.auth().deleteUser(uid);
      this.logger.log(`Successfully deleted Firebase user: ${uid}`);
    } catch (error) {
      this.logger.error(`Error deleting Firebase user: ${uid}`, error);
      // We don't throw error if the user is already gone from Firebase
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
    }
  }

  async verifyIdToken(token: string) {
    return admin.auth().verifyIdToken(token);
  }

  async generatePasswordResetLink(email: string): Promise<string> {
    try {
      this.logger.log(`Generating password reset link for: ${email}`);
      // Simplest call possible to narrow down the error
      return await admin.auth().generatePasswordResetLink(email);
    } catch (error) {
      this.logger.error(`Error generating reset link: ${email}`, error);
      throw error;
    }
  }

  async updatePassword(uid: string, newPassword: string): Promise<void> {
    try {
      this.logger.log(`Updating Firebase password for UID: ${uid}`);
      await admin.auth().updateUser(uid, {
        password: newPassword,
      });
    } catch (error) {
      this.logger.error(`Error updating Firebase password for UID: ${uid}`, error);
      throw error;
    }
  }
}
