import {
	Entity,
	Column,
	OneToMany,
	Index,
	BeforeInsert,
	BeforeUpdate,
	AfterLoad,
	OneToOne,
	JoinColumn,
} from "typeorm";
import { Base } from "./Base";
import { User } from "./User";

enum WeekStart {
	MONDAY = "MONDAY",
	TUESDAY = "TUESDAY",
	WEDNESDAY = "WEDNESDAY",
	THURSDAY = "THURSDAY",
	FRIDAY = "FRIDAY",
	SATURDAY = "SATURDAY",
	SUNDAY = "SUNDAY",
}

enum TimeFormat {
	HOUR12 = "HOUR12",
	HOUR24 = "HOUR24",
}

enum DateFormat {
	"MM/DD/YYYY" = "MM/DD/YYYY",
	"MM-DD-YYYY" = "MM-DD-YYYY",
	"MM DD YYYY" = "MM DD YYYY",
	"MM.DD.YYYY" = "MM.DD.YYYY",
	"DD/MM/YYYY" = "DD/MM/YYYY",
	"DD-MM-YYYY" = "DD-MM-YYYY",
	"DD MM YYYY" = "DD MM YYYY",
	"DD.MM.YYYY" = "DD.MM.YYYY",
	"YYYY/MM/DD" = "YYYY/MM/DD",
	"YYYY-MM-DD" = "YYYY-MM-DD",
	"YYYY MM DD" = "YYYY MM DD",
	"YYYY.MM.DD" = "YYYY.MM.DD",
	"YYYY/DD/MM" = "YYYY/DD/MM",
	"YYYY-DD-MM" = "YYYY-DD-MM",
	"YYYY DD MM" = "YYYY DD MM",
	"YYYY.DD.MM" = "YYYY.DD.MM",
}

@Entity()
export class UserSettings extends Base {
	@Column({ default: WeekStart.MONDAY, enum: WeekStart, type: "enum" })
	public weekStart!: WeekStart;

	@Column({ default: "Europe/Berlin" })
	public timeZone!: string;

	@Column({ type: "enum", enum: TimeFormat, default: TimeFormat.HOUR12 })
	public timeFormat!: TimeFormat.HOUR12;

	@Column({ type: "enum", enum: DateFormat, default: DateFormat["MM/DD/YYYY"] })
	public dateFormat!: DateFormat;

	@Column({ default: false })
	public sendNewsletter!: Boolean;

	@Column({ default: false })
	public weeklyUpdates: Boolean;

	@Column({ default: false })
	public longRunning!: Boolean;

	@Column({
		type: "jsonb",
		default: {
			group: "Project",
			subgroup: "Time Entry",
		},
	})
	public summaryReportSettings!: {
		group: string;
		subgroup: string;
	};

	@Column({ default: false })
	public isCompactViewOn!: Boolean;

	@Column({ default: "ME" })
	public dashboardSelection!: string;

	@Column({ default: "PROJECT" })
	public dashboardViewType!: string;

	@Column({ default: false })
	public dashboardPinToTop!: Boolean;

	@Column({ default: 50 })
	public projectListCollapse!: number;

	@Column({ default: false })
	public collapseAllProjectLists!: Boolean;

	@Column({ default: false })
	public groupSimilarEntriesDisabled!: Boolean;

	@Column({ default: "09:00" })
	public myStartOfDay!: string;

	@Column({ default: false })
	public darkTheme!: Boolean;

	// Relations
	@OneToOne(() => User, (user) => user.userSettings, {
		onDelete: "CASCADE",
	})
	@JoinColumn()
	public user!: User;
}
