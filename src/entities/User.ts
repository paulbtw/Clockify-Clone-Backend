import {
	Entity,
	Column,
	OneToMany,
	Index,
	BeforeInsert,
	BeforeUpdate,
	AfterLoad,
	JoinColumn,
	OneToOne,
} from "typeorm";
import { Memberships } from "./Memberships";
import bcrypt from "bcrypt";
import { Base } from "./Base";
import { Client } from "./Client";
import { Favorite } from "./Favorites";
import { Project } from "./Project";
import { TimeEntries } from "./TimeEntries";
import { Notifications } from "./Notifications";
import { UserSettings } from "./UserSettings";
import { Tag } from "./Tag";

export enum UserStatus {
	ACTIVE = "ACTIVE",
	INACTIVE = "INACTIVE",
	PENDING_EMAIL_VERIFICATION = "PENDING_EMAIL_VERIFICATION",
	BANNED = "BANNED",
}

@Entity()
export class User extends Base {
	@Column({ nullable: false, length: 256, type: "varchar" })
	public name!: string;

	@Column({ type: "varchar", nullable: true })
	public password!: string;

	@Column({ nullable: false, unique: true, length: 200, type: "varchar" })
	@Index({ unique: true })
	public email!: string;

	@Column({ nullable: true, default: null })
	public defaultWorkspace!: string;

	@Column({ nullable: true, default: null })
	public activeWorkspace!: string;

	@Column({ default: false })
	public isVerified!: boolean;

	@Column({ nullable: true, type: "varchar" })
	public isVerifiedToken!: string;

	@Column({ nullable: true, type: "varchar" })
	@Index({ unique: true })
	public passwordResetToken!: string;

	@Column({ default: () => "NOW()" })
	public passwordResetExpires!: Date;

	@Column({
		type: "enum",
		enum: UserStatus,
		default: UserStatus.ACTIVE,
	})
	public status!: UserStatus;

	@Column({
		default: "https://s3.eu-central-1.amazonaws.com/clockify/no-user-image.png",
	})
	public profilePicture!: string;

	public tempPassword: string;

	//Relations
	@OneToMany((type) => Memberships, (memberships) => memberships.users, {
		cascade: true,
	})
	public memberships!: Memberships[];

	@OneToMany((type) => Client, (client) => client.user, {
		cascade: true,
	})
	public clients: Client[];

	@OneToMany((type) => Favorite, (favorites) => favorites.user, {
		cascade: true,
	})
	public favorites: Favorite[];

	@OneToMany((type) => Project, (project) => project.user, {
		cascade: true,
	})
	public projects: Project[];

	@OneToMany((type) => TimeEntries, (timeEntries) => timeEntries.user, {
		cascade: true,
	})
	public timeEntries: TimeEntries[];

	@OneToMany((type) => Notifications, (notifications) => notifications.user, {
		cascade: true,
	})
	public notifications: Notifications[];

	@OneToOne(() => UserSettings, (userSettings) => userSettings.user, {
		cascade: true,
	})
	public userSettings: UserSettings;

	@OneToMany((type) => Tag, (tags) => tags.user, {
		cascade: true,
	})
	public tags: Tag[];

	//Functions
	public async comparePassword(password: string): Promise<boolean> {
		return await bcrypt.compare(password, this.password);
	}

	@AfterLoad()
	private loadTempPassword(): void {
		this.tempPassword = this.password;
	}

	@BeforeInsert()
	@BeforeUpdate()
	private async hashPassword(): Promise<void> {
		if (this.tempPassword !== this.password) {
			this.password = await bcrypt.hash(this.password, 12);
			this.loadTempPassword();
		}
	}
}
