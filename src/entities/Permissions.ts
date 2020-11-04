import { Entity, Column, ManyToOne, Index } from "typeorm";
import { Workspace } from "./Workspace";
import { User } from "./User";
import { Base } from "./Base";

export enum MembershipPermissions {
  WORKSPACE_OWN = "WORKSPACE_OWN",
  WORKSPACE_ADMIN = "WORKSPACE_ADMIN",
}

@Entity()
@Index(["userId", "workspaceId"])
export class Permissions extends Base {
  @Column({ type: "enum", enum: MembershipPermissions, nullable: false })
  public permission!: string;

  //Relations
  @ManyToOne((type) => User, (user) => user.permissions)
  public user!: User;

  @Column()
  public userId!: string;

  @ManyToOne((type) => Workspace, (workspace) => workspace.permissions)
  public workspace: Workspace;

  @Column()
  public workspaceId!: string;
}
