import { Organization } from '../models/organization';
import { generate } from 'shortid';

export const CREATE_NOTIFICATION = 'CREATE_NOTIFICATION';

export type NotificationProps = {
    id?: string;
    icon?: string;
    subject?: string;
    body?: string;
    source?: any;
};

export interface CreateNotification {
    type: typeof CREATE_NOTIFICATION;
    data: NotificationProps;
    organizationId: string;
    doNotDisturb: boolean;
}

export type CreateNotificationType = CreateNotification;

export type createNotificationFn = (data: NotificationProps, organizationId: string, doNotDisturb: boolean) => void;
export function createNotification(data: NotificationProps, organizationId: string = void 0, doNotDisturb = false) {
    return <CreateNotification>{ type: CREATE_NOTIFICATION, data: { id: generate(), ...data }, organizationId, doNotDisturb };
}

export const TAKE_ACTION_ON_NOTIFICATION = 'TAKE_ACTION_ON_NOTIFICATION';

export interface TakeActionOnNotification {
    type: typeof TAKE_ACTION_ON_NOTIFICATION;
    data: NotificationProps;
    organizationId: string;
}

export type TakeActionOnNotificationType = TakeActionOnNotification;

export type takeActionOnNotificationFn = (data: NotificationProps, organizationId: string) => void;
export function takeActionOnNotification(data: NotificationProps, organizationId: string = void 0) {
    return <TakeActionOnNotification>{ type: TAKE_ACTION_ON_NOTIFICATION, data, organizationId };
}

export type ActionType = CreateNotificationType | TakeActionOnNotificationType;
