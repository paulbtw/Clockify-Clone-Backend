import { NotificationType } from "../entities/Notifications";

interface NotificationDataBase {
	id: string;
	type: NotificationType;
}

export interface NotificationInvite extends NotificationDataBase {
	creation: string | Date;
	invitationCode: null | string;
	invitedBy: string;
	workspaceId: string;
	workspaceName: string;
	isUsingFullAccess: boolean;
	usingFullAccess: boolean;
}

export interface NotificationMessage extends NotificationDataBase {
	email: string;
}
