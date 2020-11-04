import { Entity, Column, ManyToOne, Index } from "typeorm";
import { Workspace } from "./Workspace";
import { User } from "./User";
import { Base } from "./Base";

enum MembershipStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

enum MembershipType {
  WORKSPACE = "WORKSPACE",
}

@Entity()
@Index(["usersId", "workspaceId"], { unique: true })
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

  //Relations
  @ManyToOne((type) => User, (user) => user.memberships)
  public users: User;

  @Column()
  public usersId!: string;

  @ManyToOne((type) => Workspace, (workspace) => workspace.members)
  public workspace: Workspace;

  @Column()
  public workspaceId!: string;
}
