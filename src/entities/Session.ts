import { Column, Entity, PrimaryColumn } from "typeorm";

// Express session entity
@Entity()
export class Session {
	@PrimaryColumn({ nullable: false })
	public sid!: string;

	@Column({ type: "json" })
	public sess!: { [key: string]: any };

	@Column({ type: "timestamp without time zone" })
	public expire: string | Date;
}
