import { Entity, Column, OneToMany } from "typeorm";
import { Memberships } from "./Memberships";
import { Permissions } from "./Permissions";
import { Base } from "./Base";
import { Client } from "./Client";
import { Project } from "./Project";
import { Tag } from "./Tag";
import { TimeEntries } from "./TimeEntries";

@Entity()
export class Workspace extends Base {
  @Column({ nullable: false, default: "", length: 200, type: "varchar" })
  public name!: string;

  @Column({ nullable: false, default: "" })
  public imageUrl!: string;

  @Column({ default: null })
  public features!: string;

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

  @Column({
    type: "jsonb",
    nullable: false,
    default: {
      amount: 0,
      currency: "EUR",
    },
  })
  public costRate!: {
    amount: number;
    currency: string;
  };

  @Column({
    type: "jsonb",
    nullable: false,
    default: {
      timeRoundingInReports: false,
      onlyAdminsCreateProject: true,
      onlyAdminsSeeBillableRates: true,
      onlyAdminsSeeDashboard: false,
      defaultBillableProjects: true,
      isProjectPublicByDefault: true,
      lockTimeEntries: null,
      projectFavorites: true,
      canSeeTimeSheet: false,
      canSeeTracker: true,
      projectPickerSpecialFilter: false,
      forceProjects: false,
      forceTasks: false,
      forceTags: false,
      forceDescription: false,
      onlyAdminsSeeAllTimeEntries: false,
      onlyAdminsSeePublicProjectsEntries: false,
      trackTimeDownToSecond: true,
      projectGroupingLabel: "client",
      adminOnlyPages: [],
      automaticLock: null,
      onlyAdminsCreateTag: false,
      isCostRateActive: false,
      timeApprovalEnabled: false,
      onlyAdminsCreateTask: false,
    },
  })
  public workspaceSettings!: {
    timeRoundingInReports: boolean;
    onlyAdminsCreateProject: boolean;
    onlyAdminsSeeBillableRates: boolean;
    onlyAdminsSeeDashboard: boolean;
    defaultBillableProjects: boolean;
    isProjectPublicByDefault: boolean;
    lockTimeEntries: null;
    projectFavorites: boolean;
    canSeeTimeSheet: boolean;
    canSeeTracker: boolean;
    projectPickerSpecialFilter: boolean;
    forceProjects: boolean;
    forceTasks: boolean;
    forceTags: boolean;
    forceDescription: boolean;
    onlyAdminsSeeAllTimeEntries: boolean;
    onlyAdminsSeePublicProjectEntries: boolean;
    trackTimeDownToSecond: boolean;
    projectGroupingLabel: string;
    adminOnlyPages: [];
    automaticLock: null;
    onlyAdminsCreateTag: boolean;
    isCostRateActive: boolean;
    timeApprovalEnabled: boolean;
    onlyAdminsCreateTask: boolean;
  };

  @Column({
    type: "jsonb",
    default: {
      round: "Round to nearest",
      minutes: 15,
    },
  })
  public round!: {
    round: string;
    minutes: number;
  };

  @Column({ default: null })
  public featureSubscriptionType!: string;

  @Column({ default: false, nullable: false })
  public onSubdomain!: boolean;

  //Relations
  @OneToMany((type) => Memberships, (memberships) => memberships.workspace)
  public members: Memberships[];

  @OneToMany((type) => Permissions, (permissions) => permissions.workspace)
  public permissions: Permissions[];

  @OneToMany((type) => Client, (client) => client.workspace)
  public clients: Client[];

  @OneToMany((type) => Project, (project) => project.workspace)
  public projects: Project[];

  @OneToMany((type) => Tag, (tag) => tag.workspace)
  public tags: Tag[];

  @OneToMany((type) => TimeEntries, (timeEntries) => timeEntries.workspace)
  public timeEntries: TimeEntries[];
}
