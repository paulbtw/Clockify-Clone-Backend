import {
  Entity,
  Column,
  ManyToOne,
  Index,
} from "typeorm";
import { Base } from "./Base";
import { Workspace } from "./Workspace";

@Entity()
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
}
