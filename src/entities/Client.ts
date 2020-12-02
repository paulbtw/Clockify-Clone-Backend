import { Entity, Column, OneToMany, ManyToOne } from "typeorm";
import { Base } from "./Base";
import { User } from "./User";
import { Workspace } from "./Workspace";
import { Project } from "./Project";

@Entity()
export class Client extends Base {
	@Column({ nullable: false, default: "" })
	public name!: string;

	@Column({ default: false, nullable: false })
	public archived!: boolean;

	//Relations
	@Column({ nullable: false })
	public userId!: string;

	@ManyToOne((type) => User, (user) => user.clients)
	public user: User;

	@Column({ nullable: false })
	public workspaceId!: string;

	@ManyToOne((type) => Workspace, (workspace) => workspace.clients)
	public workspace: Workspace;

	@OneToMany((type) => Project, (project) => project.client)
	public projects: Project[];
}
