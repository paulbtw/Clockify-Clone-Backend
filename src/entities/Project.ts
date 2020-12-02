import { Entity, Column, OneToMany, ManyToOne, Index } from "typeorm";
import { Base } from "./Base";
import { Favorite } from "./Favorites";
import { Client } from "./Client";
import { Workspace } from "./Workspace";
import { User } from "./User";
import { TimeEntries } from "./TimeEntries";
import { Tasks } from "./Task";

@Entity()
export class Project extends Base {
	@Column({ nullable: false, default: "" })
	public name!: string;

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

	@Column({ nullable: false, default: false })
	public billable!: boolean;

	@Column({ default: "#ffffff", nullable: false })
	public color!: string;

	@Column({
		type: "jsonb",
		nullable: false,
		default: { estimate: "PT0S", type: "AUTO" },
	})
	public estimate!: {
		estimate: string;
		type: string;
	};

	@Column({ nullable: false, default: false })
	public archived!: boolean;

	@Column({ nullable: false, default: "" })
	public note!: string;

	@Column({ nullable: false, default: "PT0S" })
	public duration!: string;

	@Column({ nullable: false, default: false })
	public template!: boolean;

	@Column({ nullable: false, default: true })
	public public!: boolean;

	//Relations
	@Column({ default: null })
	public clientId: string | null;

	@ManyToOne((type) => Client, (client) => client.projects)
	public client: Client;

	@Column({ nullable: false })
	@Index()
	public workspaceId!: string;

	@ManyToOne((type) => Workspace, (workspace) => workspace.projects)
	public workspace: Workspace;

	@Column({ nullable: false })
	public userId!: string;

	@ManyToOne((type) => User, (user) => user.projects)
	public user: User;

	@OneToMany((type) => Favorite, (favorites) => favorites.project, {
		cascade: true,
	})
	public favorites: Favorite[];

	@OneToMany((type) => TimeEntries, (timeEntries) => timeEntries.project)
	public timeEntries: TimeEntries[];

	@OneToMany((type) => Tasks, (tasks) => tasks.project)
	public tasks: Tasks[];
}
