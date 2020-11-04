import { Entity, Column, Index, ManyToOne } from "typeorm";
import { Base } from "./Base";
import { User } from "./User";
import { Project } from "./Project";

@Entity()
@Index(["userId", "projectId"], { unique: true })
export class Favorite extends Base {
  // Relations
  @Column({ nullable: false })
  public userId!: string;

  @ManyToOne((type) => User, (user) => user.favorites)
  public user: User;

  @Column({ nullable: false })
  public projectId!: string;

  @ManyToOne((type) => Project, (project) => project.favorites)
  public project: Project;
}
