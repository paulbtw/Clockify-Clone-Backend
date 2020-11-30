import { ConnectionOptions } from "typeorm";
import { ENVIRONMENT, POSTGRES_DB_URL } from "./secrets";

const startDir = ENVIRONMENT === "production" ? "dist" : "src";

const config: ConnectionOptions = {
  type: "postgres",
  url: POSTGRES_DB_URL,
  // dropSchema: ENVIRONMENT === "test" ? true : false,
  synchronize: true,
  entities: [
    `${startDir}/entities/Client{.ts,.js}`,
    `${startDir}/entities/Favorites{.ts,.js}`,
    `${startDir}/entities/Memberships{.ts,.js}`,
    `${startDir}/entities/Notifications{.ts,.js}`,
    `${startDir}/entities/Permissions{.ts,.js}`,
    `${startDir}/entities/Project{.ts,.js}`,
    `${startDir}/entities/Tag{.ts,.js}`,
    `${startDir}/entities/TimeEntries{.ts,.js}`,
    `${startDir}/entities/User{.ts,.js}`,
    `${startDir}/entities/Workspace{.ts,.js}`,
    `${startDir}/entities/UserSettings{.ts,.js}`,
    `${startDir}/entities/Session{.ts,.js}`,
    `${startDir}/entities/Task{.ts,.js}`,
  ],
};

export default config;
