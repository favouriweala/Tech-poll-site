
import { EventEmitter } from 'events';

class PollUpdateEmitter extends EventEmitter {}

export const pollUpdateEmitter = new PollUpdateEmitter();
