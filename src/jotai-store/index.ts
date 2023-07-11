import { atom } from "jotai";
import { Admin, User } from "../types";

export const currentUserAtom = atom<User|null>(null);

export const currentAdminAtom = atom<Admin|null>(null);