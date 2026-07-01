// SQL inlined as strings to avoid Metro bundler issues with .sql imports

const m0000 = `CREATE TABLE \`bac_legumes\` (
	\`bac_id\` text NOT NULL,
	\`legume_id\` text NOT NULL,
	FOREIGN KEY (\`bac_id\`) REFERENCES \`bacs\`(\`id\`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (\`legume_id\`) REFERENCES \`legumes\`(\`id\`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE \`bacs\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`nom\` text NOT NULL,
	\`l\` real DEFAULT 0,
	\`L\` real DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE \`harvests\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`date\` text NOT NULL,
	\`legume_id\` text NOT NULL,
	\`qty\` integer DEFAULT 1 NOT NULL,
	\`poids\` real,
	\`longueur\` real,
	\`variete\` text,
	\`bac_id\` text,
	\`notes\` text,
	\`season_id\` integer NOT NULL,
	FOREIGN KEY (\`legume_id\`) REFERENCES \`legumes\`(\`id\`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (\`bac_id\`) REFERENCES \`bacs\`(\`id\`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (\`season_id\`) REFERENCES \`seasons\`(\`id\`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE \`invest\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`type\` text NOT NULL,
	\`libelle\` text NOT NULL,
	\`montant\` real NOT NULL,
	\`season_id\` integer
);
--> statement-breakpoint
CREATE TABLE \`legumes\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`nom\` text NOT NULL,
	\`prix\` real NOT NULL,
	\`unite\` text NOT NULL,
	\`source\` text,
	\`color\` text NOT NULL,
	\`maj\` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE \`season_legumes\` (
	\`season_id\` integer NOT NULL,
	\`legume_id\` text NOT NULL,
	FOREIGN KEY (\`season_id\`) REFERENCES \`seasons\`(\`id\`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (\`legume_id\`) REFERENCES \`legumes\`(\`id\`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE \`seasons\` (
	\`id\` integer PRIMARY KEY NOT NULL,
	\`label\` text NOT NULL,
	\`active\` integer DEFAULT 0
);`;

export default {
  journal: {
    version: "7",
    dialect: "sqlite",
    entries: [
      {
        idx: 0,
        version: "6",
        when: 1782897419477,
        tag: "0000_mighty_mac_gargan",
        breakpoints: true,
      },
    ],
  },
  migrations: {
    m0000,
  },
};
