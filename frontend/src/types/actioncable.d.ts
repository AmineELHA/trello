declare module '@rails/actioncable' {
  export interface ActionCable {
    createConsumer(url?: string): any;
  }
  
  export function createConsumer(url?: string): any;
  
  export const ActionCable: ActionCable;
}