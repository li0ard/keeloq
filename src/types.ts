/** Parsed `hop` */
export interface Hop {
    /** Button code */
    btn: number,
    /** Serial part (`serial & 0x3ff`) */
    serial: number,
    /** Counter */
    cnt: number,
    /** RAW `hop` */
    raw: number
}

export interface FixAndEncryptedHop {
    fix: number,
    hop: number
}

/** KeeLoq Learning types */
export enum LearningTypes {
    SIMPLE_LEARNING = 0,
    NORMAL_LEARNING = 1,
    SECURE_LEARNING = 2
}