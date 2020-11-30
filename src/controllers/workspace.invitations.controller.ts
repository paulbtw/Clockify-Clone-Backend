import { Request, Response, NextFunction } from "express";
import { body, param, validationResult } from "express-validator";
import { getRepository } from "typeorm";
import { Memberships, MembershipStatus } from "../entities/Memberships";
import { Notifications, NotificationStatus } from "../entities/Notifications";
import { ErrorObject, validationHandler } from "../helper/error-handler";

/**
 * Accept or decline a pending invite.
 * @route PUT /workspaces/:workspaceId/users/:userId/invitations
 */
export const putWorkspaceInvitationResponse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await body("notificationId", "Notification ID is not valid")
      .isUUID()
      .run(req);
    await body("status", "Status has to be a boolean").isBoolean().run(req);
    await param("userId", "User ID is not valid").equals(req.user.id).run(req);
    validationHandler(validationResult(req));

    const userId = req.user.id;

    const { notificationId, status, workspaceId } = req.body;
    if (status) {
      // Accept
      await getRepository(Memberships)
        .createQueryBuilder()
        .update()
        .set({
          membershipStatus: MembershipStatus.ACTIVE,
        })
        .where("workspaceId = :workspaceId AND usersId = :userId", {
          workspaceId: workspaceId,
          userId: userId,
        })
        .execute();
    } else {
      // Decline
      await getRepository(Memberships)
        .createQueryBuilder()
        .delete()
        .where("workspaceId = :workspaceId AND usersId = :userId", {
          workspaceId: workspaceId,
          userId: userId,
        })
        .execute();
    }

    await getRepository(Notifications)
      .createQueryBuilder()
      .update()
      .set({
        status: NotificationStatus.READ,
      })
      .where("id = :notificationId", { notificationId: notificationId })
      .execute();
    return res.status(201).json({ success: true });
  } catch (err) {
    next(err);
  }
};
