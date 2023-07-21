export enum EventType {
  Request = "REQUEST",
  Response = "RESPONSE",
}

export type CustomEventDetail<T> = {
  endpoint: string;
  data: T;
  type: EventType.Request;
};
