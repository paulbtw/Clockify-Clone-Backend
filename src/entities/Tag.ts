import { Entity, Column, ManyToOne, Index } from "typeorm";
import { Base } from "./Base";
import { User } from "./User";
import { Workspace } from "./Workspace";

@Entity()
@Index(["userId", "workspaceId"])
@Index(["name", "workspaceId"], { unique: true })
export class Tag extends Base {
	@Column({ type: "varchar", length: 100, default: "", nullable: false })
	public name!: string;

	@Column({ nullable: false, default: false })
	public archived!: boolean;

	//Relations
	@Column()
	@Index()
	public workspaceId!: string;

	@ManyToOne((type) => Workspace, (workspace) => workspace.tags)
	public workspace: Workspace;

	@Column()
	@Index()
	public userId!: string;

	@ManyToOne((type) => User, (user) => user.tags)
	public user: User;
}
