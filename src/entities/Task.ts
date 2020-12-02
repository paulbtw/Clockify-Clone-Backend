import { Column, Entity, Index, ManyToOne } from "typeorm";
import { Base } from "./Base";
import { Project } from "./Project";

export enum TaskStatus {
	ACTIVE = "ACTIVE",
	DONE = "DONE",
}

@Entity()
@Index(["id", "projectId"])
export class Tasks extends Base {
	@Column({ type: "varchar", length: 100, nullable: false })
	public name!: string;

	@Column({ type: "integer", default: 0, nullable: false })
	public estimate!: number;

	@Column({ type: "integer", default: 0, nullable: false })
	public duration!: number;

	@Column({ type: "enum", enum: TaskStatus, default: TaskStatus.ACTIVE })
	public status!: TaskStatus;

	// Relations
	@ManyToOne((type) => Project, (project) => project.tasks, {
		onDelete: "CASCADE",
	})
	public project: Project;

	@Column()
	public projectId!: string;
}
