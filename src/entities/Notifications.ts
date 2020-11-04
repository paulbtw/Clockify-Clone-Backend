import {
  Entity,
  Column,
  OneToMany,
  Index,
  BeforeInsert,
  BeforeUpdate,
  ManyToOne,
} from "typeorm";
import { Base } from "./Base";
import { User } from "./User";

enum NotificationStatus {
  UNREAD = "UNREAD",
  READ = "READ",
}

enum NotificationType {
  USER_SETTINGS = "USER_SETTINGS",
  ACCOUNT_VERIFICATION = "ACCOUNT_VERIFICATION",
}

@Entity()
export class Notifications extends Base {
  @Column({
    nullable: false,
    type: "enum",
    enum: NotificationStatus,
    default: NotificationStatus.UNREAD,
  })
  public status!: NotificationStatus;

  @Column({ nullable: false, type: "enum", enum: NotificationType })
  public type!: NotificationType;

  @Column({ type: "jsonb", nullable: false })
  public data!: {
    message: string;
    title: string;
    type: NotificationType;
  };

  @Column()
  public userId!: string;

  @ManyToOne((type) => User, (user) => user.notifications)
  public user: User;
}
