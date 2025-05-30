import { MigrationInterface } from "typeorm";
import { AddClientDetails1746444913609 } from "./01/1746444913609-AddClientDetails";
import { NotesExpansion1748518686365 } from "./01/1748518686365-NotesExpansion";

export const migrations: any[] = [
    AddClientDetails1746444913609,
    NotesExpansion1748518686365
]