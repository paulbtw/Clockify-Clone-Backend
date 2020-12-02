import {
	Entity,
	Column,
	ManyToOne,
	Index,
	AfterLoad,
	BeforeInsert,
	BeforeUpdate,
} from "typeorm";
import { Base } from "./Base";
import { User } from "./User";
import { Workspace } from "./Workspace";
import { Project } from "./Project";

@Entity()
@Index(["userId", "workspaceId"])
export class TimeEntries extends Base {
	@Column({ nullable: false, default: "" })
	public description!: string;

	@Column({ nullable: false, default: false })
	public billable!: boolean;

	@Column({ nullable: false })
	public start!: Date;

	@Column({ nullable: true })
	public end!: Date | null;

	@Column({ nullable: true })
	public duration!: number | null;

	@Column({ nullable: false, default: false })
	public isLocked!: boolean;

	//Relations
	@Column({ nullable: false })
	@Index()
	public userId!: string;

	@ManyToOne((type) => User, (user) => user.timeEntries, {
		onDelete: "CASCADE",
	})
	public user: User;

	@Column({ nullable: false })
	@Index()
	public workspaceId!: string;

	@ManyToOne((type) => Workspace, (workspace) => workspace.timeEntries, {
		onDelete: "SET NULL",
	})
	public workspace: Workspace;

	@Column({ default: null })
	@Index()
	public projectId!: string | null;

	@ManyToOne((type) => Project, (project) => project.timeEntries)
	public project: Project[];

	@BeforeInsert()
	@BeforeUpdate()
	private insertDuration(): void {
		if (this.start && this.end) {
			this.duration =
				new Date(this.end).getTime() - new Date(this.start).getTime();
		}
	}
}
