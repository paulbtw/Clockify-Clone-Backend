import {
	Entity,
	Column,
	OneToMany,
	Index,
	BeforeInsert,
	BeforeUpdate,
	ManyToOne,
} from "typeorm";
import {
	NotificationInvite,
	NotificationMessage,
} from "../interfaces/Notifications";
import { Base } from "./Base";
import { User } from "./User";

export enum NotificationStatus {
	UNREAD = "UNREAD",
	READ = "READ",
}

export enum NotificationType {
	USER_SETTINGS = "USER_SETTINGS",
	ACCOUNT_VERIFICATION = "ACCOUNT_VERIFICATION",
	WORKSPACE_INVITATION = "WORKSPACE_INVITATION",
}

@Entity()
export class Notifications extends Base {
	@Column({
		nullable: false,
		type: "enum",
		enum: NotificationStatus,
		default: NotificationStatus.UNREAD,
	})
	public status!: NotificationStatus;

	@Column({ nullable: false, type: "enum", enum: NotificationType })
	public type!: NotificationType;

	@Column({ type: "jsonb", nullable: false })
	public data!: NotificationInvite | NotificationMessage;

	@Column()
	public userId!: string;

	@ManyToOne((type) => User, (user) => user.notifications)
	public user: User;
}
