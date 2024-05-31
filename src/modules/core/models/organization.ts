export interface Organization {
    host?: string;
    name?: string;
    short?: string;
    color?: string;
}

export interface OrganizationState {
    badgeCountByName: {
        [name: string]: number;
    };
    unseenByName: {
        [name: string]: boolean;
    };
}

export interface OrganizationStateSlice {
    organization?: OrganizationState;
}
