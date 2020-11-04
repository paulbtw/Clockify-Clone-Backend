import { ConnectionOptions } from "typeorm";

const startDir = process.env.NODE_ENV === "production" ? "dist" : "src";

export const config: ConnectionOptions = {
  type: "postgres",
  url: process.env.DB_URL,
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
  ],
};
