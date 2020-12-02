import { Entity, Column, ManyToOne, Index } from "typeorm";
import { Workspace } from "./Workspace";
import { User } from "./User";
import { Base } from "./Base";

export enum MembershipStatus {
	ACTIVE = "ACTIVE",
	INACTIVE = "INACTIVE",
	PENDING = "PENDING",
}

export enum MembershipType {
	WORKSPACE = "WORKSPACE",
}

export enum MembershipPermissions {
	WORKSPACE_OWN = "WORKSPACE_OWN",
	WORKSPACE_ADMIN = "WORKSPACE_ADMIN",
	WORKSPACE_USER = "WORKSPACE_USER",
}

@Entity()
@Index(["usersId", "workspaceId"], { unique: true })
@Index(["usersId", "workspaceId", "membershipStatus"])
export class Memberships extends Base {
	@Column({
		type: "enum",
		enum: MembershipStatus,
		default: MembershipStatus.ACTIVE,
		nullable: false,
	})
	public membershipStatus!: MembershipStatus;

	@Column({
		type: "enum",
		enum: MembershipType,
		default: MembershipType.WORKSPACE,
		nullable: false,
	})
	public membershipType!: MembershipType;

	@Column({
		type: "jsonb",
		nullable: false,
		default: {
			amount: 0,
			currency: "EUR",
		},
	})
	public hourlyRate!: {
		amount: number;
		currency: string;
	};

	@Column({
		type: "enum",
		enum: MembershipPermissions,
		nullable: false,
		default: MembershipPermissions.WORKSPACE_USER,
	})
	public permissions!: MembershipPermissions;

	//Relations
	@ManyToOne((type) => User, (user) => user.memberships, {
		onDelete: "CASCADE",
	})
	public users: User;

	@Column()
	public usersId!: string;

	@ManyToOne((type) => Workspace, (workspace) => workspace.members, {
		onDelete: "CASCADE",
	})
	public workspace: Workspace;

	@Column()
	public workspaceId!: string;
}
